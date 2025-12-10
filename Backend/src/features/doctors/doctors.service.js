const { createClient } = require('@supabase/supabase-js');

// --- Supabase Client Configuration ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize the Admin Supabase Client
if (!supabaseServiceKey) {
    throw new Error("❌ CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is not set. Cannot run Admin operations.");
}
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Define the database table names
const DOCTORS_TABLE = 'doctors';

// --- CREATE (POST) ---
const createDoctor = async (data) => {
    const { email, password, role, name, specialty, qualifications, reviews, location, phone } = data;

    // 1. Securely Create the User Account (Auth)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { name: name, role: role } // Metadata is stored here
    });

    if (authError) {
        throw new Error(`Auth creation failed: ${authError.message}`);
    }

    const newUserId = authData.user.id;
    console.log(`[DEBUG] Auth User created with ID: ${newUserId}`); // New Debug Log

    // 2. Create the Doctor Profile Details (public.doctors table)
    const doctorDetails = {
        user_id: newUserId, // Foreign key linking to auth.users
        name: name,
        specialty: specialty,
        qualifications: qualifications,
        reviews: reviews,
        location: location,
        phone: phone 
    };
    
    // Clean up undefined properties before insertion
    Object.keys(doctorDetails).forEach(key => doctorDetails[key] === undefined && delete doctorDetails[key]);

    const { data: doctorData, error: doctorError } = await supabaseAdmin
        .from(DOCTORS_TABLE)
        .insert([doctorDetails])
        .select();

    if (doctorError) {
        // Log the detailed error message for diagnosis
        console.error(`[CRITICAL DB ERROR] Doctor detail insertion failed for User ${newUserId}: ${doctorError.message}`); 
        // Attempt to clean up the auth user if profile insertion failed
        await supabaseAdmin.auth.admin.deleteUser(newUserId); 
        throw new Error(`Doctor detail insertion failed: ${doctorError.message}`);
    }

    // Return the created doctor data
    console.log(`[INFO] Doctor profile successfully created for User ${newUserId}.`); // New Success Log
    return doctorData[0];
};

// --- READ ALL (GET /) ---
const getAllDoctors = async (filters) => {
    // 1. Fetch doctor details and the linked user data (which contains email)
    const { data: doctors, error } = await supabaseAdmin
        .from(DOCTORS_TABLE)
        .select(`
            *, 
            auth_user:user_id (
                email,
                user_metadata
            )
        `); 

    if (error) {
        throw new Error(`Database query failed: ${error.message}`);
    }
    
    // 2. Map the data structure to flatten the user data and extract metadata
    return doctors.map(doctor => {
        const authUser = doctor.auth_user || {};
        const metadata = authUser.user_metadata || {};
        
        return {
            ...doctor,
            // Promote user details to the top level
            email: authUser.email,
            userName: metadata.name, // Extract name from metadata
            role: metadata.role, // Extract role from metadata
            
            // Cleanup nested objects
            auth_user: undefined, 
            user_metadata: undefined,
        };
    });
};


// --- READ ONE (GET /:id) ---
const getDoctorById = async (id) => {
    const { data: doctor, error } = await supabaseAdmin
        .from(DOCTORS_TABLE)
        .select(`*, auth_user:user_id (email, user_metadata)`)
        .eq('doctor_id', id) 
        .maybeSingle(); 

    if (error) throw new Error(`Database query failed: ${error.message}`);
    if (!doctor) throw new Error(`Doctor with ID ${id} not found.`);
    
    const metadata = doctor.auth_user.user_metadata || {};

    return {
        ...doctor,
        email: doctor.auth_user.email,
        userName: metadata.name, 
        role: metadata.role,
        auth_user: undefined
    };
};


// --- UPDATE (PUT /:id) ---
const updateDoctor = async (id, updates) => {
    // Filter out fields not belonging to the doctors table, e.g., email/password/role
    const doctorUpdateData = { ...updates };
    delete doctorUpdateData.email;
    delete doctorUpdateData.password;
    delete doctorUpdateData.role;

    const { data, error } = await supabaseAdmin
        .from(DOCTORS_TABLE)
        .update(doctorUpdateData)
        .eq('doctor_id', id) 
        .select();

    if (error) throw new Error(`Failed to update doctor: ${error.message}`);
    if (data.length === 0) throw new Error(`Doctor with ID ${id} not found.`);
    
    return data[0];
};

// --- DELETE (DELETE /:id) ---
const deleteDoctor = async (id) => {
    // 1. Get the user_id (auth ID) linked to the doctor_id
    const { data: doctor, error: readError } = await supabaseAdmin
        .from(DOCTORS_TABLE)
        .select('user_id')
        .eq('doctor_id', id)
        .maybeSingle();

    if (readError) throw new Error(`Database read failed during delete check: ${readError.message}`);
    if (!doctor) throw new Error(`Doctor with ID ${id} not found.`);
    
    const userIdToDelete = doctor.user_id;

    // 2. Delete the doctor record from the public.doctors table
    const { error: deleteDoctorError } = await supabaseAdmin
        .from(DOCTORS_TABLE)
        .delete()
        .eq('doctor_id', id);

    if (deleteDoctorError) throw new Error(`Failed to delete doctor details: ${deleteDoctorError.message}`);

    // 3. Delete the user account from auth.users (CRITICAL STEP)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);

    if (deleteUserError) {
        console.warn(`Warning: Failed to delete user account ${userIdToDelete} from Auth: ${deleteUserError.message}`);
    }

    return true; 
};


// Export all service functions using CommonJS syntax
module.exports = {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
};