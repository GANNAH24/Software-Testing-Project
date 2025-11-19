import { useState } from 'react';
export const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };
  const setFieldValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };
  const setFieldError = (name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };
  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };
  return { values, errors, handleChange, setFieldValue, setFieldError, setErrors, reset };
};
export default useForm;
