import { useContext } from 'react'
import authContext from './authContext'

function useAuth() {
  return useContext(authContext)
}

export default useAuth
