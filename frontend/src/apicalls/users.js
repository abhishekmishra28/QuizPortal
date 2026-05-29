import axiosInstance from ".";

export const registerUser = async(payload) => {
    try{
      const response = await axiosInstance.post('/api/users/register',payload);
      return response.data
    }
    catch(error){
      return error.response.data
    }
}

export const loginUser = async(payload) => {
    try{
      const response = await axiosInstance.post('/api/users/login',payload);
      return response.data
    }
    catch(error){
      return error.response.data
    }
}

export const getUserInfo = async() => {
  try{
    const response = await axiosInstance.post('/api/users/get-user-info')
    return response.data
  }
  catch(error){
    return error.response.data
  }
}

export const getAllUsers = async() => {
  try{
    const response = await axiosInstance.post('/api/users/get-all-users')
    return response.data
  }
  catch(error){
    return error.response.data
  }
}

export const deleteUser = async(payload) => {
  try{
    const response = await axiosInstance.post('/api/users/delete-user', payload)
    return response.data
  }
  catch(error){
    return error.response.data
  }
}