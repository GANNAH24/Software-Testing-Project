import supabase from './supabaseClient.js';

const PROFILES_TABLE = 'profiles';
const DOCTORS_TABLE = 'doctors';

// --- CREATE (POST) ---
export const createDoctor = async (req, res) => {
    const { name, specialty, qualifications, reviews, location } = req.body;

    try {
        // 1️⃣ Check if a profile exists for this doctor
        const { data: existingProfile, error: profileError } = await supabase
            .from(PROFILES_TABLE)
            .select('id')
            .eq('full_name', name)
            .eq('role', 'doctor')
            .maybeSingle();

        if (profileError) {
            console.error('Supabase Error (PROFILE CHECK):', profileError.message);
            return res.status(500).json({
                error: 'Failed to check user profile.',
                details: profileError.message
            });
        }

        let profileId = existingProfile?.id;

        // 2️⃣ If no profile, create one
        if (!profileId) {
            const { data: newProfile, error: insertProfileError } = await supabase
                .from(PROFILES_TABLE)
                .insert([
                    { full_name: name, role: 'doctor' }
                ])
                .select('id') // Only select the ID you need
                .single();

            if (insertProfileError) {
                console.error('Supabase Error (PROFILE CREATE):', insertProfileError.message);
                return res.status(500).json({
                    error: 'Failed to create profile.',
                    details: insertProfileError.message
                });
            }

            profileId = newProfile.id;
        }

        // 3️⃣ Create doctor entry linked to the profile
        const { data: doctor, error: doctorError } = await supabase
            .from(DOCTORS_TABLE)
            .insert([
                {
                    user_id: profileId,
                    name,
                    specialty,
                    qualifications,
                    reviews,
                    location
                }
            ])
            .select()
            .single();

        if (doctorError) {
            console.error('Supabase Error (DOCTOR CREATE):', doctorError.message);
            return res.status(400).json({
                error: 'Failed to create doctor.',
                details: doctorError.message
            });
        }

        res.status(201).json(doctor);
    } catch (err) {
        console.error('Controller Error (CREATE):', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// --- READ ALL (GET /) ---
export const getAllDoctors = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from(DOCTORS_TABLE)
            .select('doctor_id, user_id, name, specialty, qualifications, reviews, location, created_at');

        if (error) {
            console.error('Supabase Error (READ ALL):', error.message);
            return res.status(500).json({ error: 'Failed to fetch doctors.', details: error.message });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('Controller Error (READ ALL):', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// --- READ ONE (GET /:id) ---
export const getDoctorById = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from(DOCTORS_TABLE)
            .select('*')
            .eq('doctor_id', id)
            .maybeSingle();

        if (error) {
            console.error('Supabase Error (READ ONE):', error.message);
            return res.status(500).json({ error: 'Failed to fetch doctor.', details: error.message });
        }

        if (!data) {
            // ✅ FIXED: Used backticks (`) for template literal string
            return res.status(404).json({ error: `Doctor with ID ${id} not found.` });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('Controller Error (READ ONE):', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// --- UPDATE (PUT /:id) ---
export const updateDoctor = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const { data, error } = await supabase
            .from(DOCTORS_TABLE)
            .update(updateData)
            .eq('doctor_id', id)
            .select()
            .single(); // Using .single() is cleaner if you expect one result

        if (error) {
            console.error('Supabase Error (UPDATE):', error.message);
            // Handle case where item is not found, which Supabase doesn't treat as a query error
            if (error.code === 'PGRST116') {
                 // ✅ FIXED: Used backticks (`) for template literal string
                return res.status(404).json({ error: `Doctor with ID ${id} not found.` });
            }
            return res.status(400).json({ error: 'Failed to update doctor.', details: error.message });
        }
        
        // Note: .single() will throw an error if no row is found, which is caught above.
        // So this check is redundant if you use .single()
        /*
        if (!data) {
            return res.status(404).json({ error: `Doctor with ID ${id} not found.` });
        }
        */

        res.status(200).json(data);
    } catch (err) {
        console.error('Controller Error (UPDATE):', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};


// --- DELETE (DELETE /:id) ---
export const deleteDoctor = async (req, res) => {
    const { id } = req.params;

    try {
        const { error, count } = await supabase
            .from(DOCTORS_TABLE)
            .delete()
            .eq('doctor_id', id);

        if (error) {
            console.error('Supabase Error (DELETE):', error.message);
            return res.status(500).json({ error: 'Failed to delete doctor.', details: error.message });
        }

        // Optional: Check if a row was actually deleted
        if (count === 0) {
            return res.status(404).json({ error: `Doctor with ID ${id} not found.` });
        }

        res.status(204).send();
    } catch (err) {
        console.error('Controller Error (DELETE):', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};