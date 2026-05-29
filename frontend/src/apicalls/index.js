import axios from 'axios'

const axiosInstance = axios.create({})

// Interceptor to attach token at request time (not module load time)
// This ensures the token is always fresh after login/refresh
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default axiosInstance