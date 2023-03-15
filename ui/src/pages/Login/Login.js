import * as React from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Field from '../../components/Field/Field'
import './styles.css'

const Login = () => {
    return <div className='login'>
    <div style={{ flex: 2, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} >
        <h1>Hi there</h1>
        <h2>Login to view your profile</h2>
    </div>
    <div style={{ flex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} >
        <Field placeholder={'Enter username or email'} />
        <Field placeholder={'Enter password'} />
    </div>
    <div style={{ flex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
        <Button label={'Login'} />
        <p>Don't have an account? <Link to="/signup" >Sign Up</Link></p>
    </div>
</div>
}

export default Login;