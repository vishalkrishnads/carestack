import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Field from '../../components/Field/Field'
import Alert from '../../components/Alert/Alert'
import defaults from '../../configs'
import './styles.css'

const SignUp = () => {

    const [name, setName] = React.useState('');
    const [username, setUserName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [alert, setAlert] = React.useState('')

    const refs = [React.useRef(null), React.useRef(null), React.useRef(null)]
    const navigate = useNavigate();

    const submit = async() => {
        if (!name || !username || !email || !password) {
            setAlert('Please fill all fields')
            return
        } else {
            try {
                const response = await fetch(`${defaults.BASE_URL}${defaults.endpoints.signup}`, {
                  method: 'POST',
                  headers: new Headers(),
                  body: JSON.stringify({
                      "name": name,
                      "username": username,
                      "password": password,
                      "email": email
                  })
                });
              
                if (response.ok) {
                  const json = await response.json();
                  localStorage.setItem("carestack_creds", JSON.stringify({
                    _id: json.uid["$oid"],
                    name: name,
                    email: email,
                    password: password,
                    username: username,
                    bio: '',
                    friends: []
                  }))
                  navigate('/home')
                } else {
                  const errorBody = await response.json();
                  throw new Error(errorBody.error);
                }
              } catch (error) {
                setAlert(error.message)
              }
              
        }
    }

    return <div className='signup'>
        <div style={{ flex: 2, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} >
            <h1>Welcome</h1>
            <h2>Enter your details to get started</h2>
        </div>
        <div className='box' style={{ flex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} >
            <Field value={name} onChangeText={value => setName(value)} onSubmit={() => refs[0].current.focus()} placeholder={'Name'} />
            <Field value={username} reference={refs[0]} onChangeText={value => setUserName(value)} onSubmit={() => refs[1].current.focus()} placeholder={'Username'} />
            <Field value={email} reference={refs[1]} onChangeText={value => setEmail(value)} onSubmit={() => refs[2].current.focus()} placeholder={'Email address'} />
            <Field value={password} reference={refs[2]} onChangeText={value => setPassword(value)} onSubmit={submit} placeholder={'Password'} />
        </div>
        <div className='box' style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} >
            <Button onPress={submit} label={'Sign Up'} />
            <p>Already have an account? <Link to="/signin" >Sign In</Link></p>
            <Alert content={alert} onDismiss={() => setAlert('')} />
        </div>
        {/* <h1>Welcome to the platform</h1>
        <h2>Enter your details to get started</h2>
        <input className='field' /> */}
    </div>
}

export default SignUp;