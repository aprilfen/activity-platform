import { authPost  } from '@/api/utils/request'
export const login = data => authPost('/users/login', data)