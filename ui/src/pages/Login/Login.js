import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Field from '../../components/Field/Field'
import Alert from '../../components/Alert/Alert'
import defaults from '../../configs'
import './styles.css'

const SignIn = () => {

    const [id, setID] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [alert, setAlert] = React.useState('')

    const ref = React.useRef(null)
    const navigate = useNavigate();

    const submit = async () => {
        if (!id || !password) {
            setAlert('Please fill all fields')
            return
        } else {
            try {
                const response = await fetch(`${defaults.BASE_URL}${defaults.endpoints.signin}`, {
                    method: 'POST',
                    headers: new Headers(),
                    body: JSON.stringify({
                        "username": id,
                        "password": password,
                        "email": id
                    })
                });

                if (response.ok) {
                    const json = await response.json();
                    localStorage.setItem("carestack_creds", JSON.stringify({
                        _id: json.uid["$oid"],
                        name: json.name.replace(/^"|"$/g, ''),
                        email: json.email.replace(/^"|"$/g, ''),
                        username: json.username.replace(/^"|"$/g, ''),
                        bio: json.bio.replace(/^"|"$/g, ''),
                        friends: json.friends
                    }))
                    navigate('/home')
                } else {
                    const errorBody = await response.json();
                    throw new Error(errorBody.error);
                }
            } catch (error) { setAlert(error.message) }
        }
    }

    React.useEffect(() => {
        if (typeof (Storage) !== "undefined") {
            let data = localStorage.getItem("carestack_creds");
            if (data != null || data != undefined) navigate('/home')
        } else {
            setAlert('Sorry. The project likely wont run on this browser because its too old. Please try with a newer version.')
        }
    }, [])

    return <div className='login'>
        <div className='box' style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} >
            <h1>Hi there</h1>
            <h2>Sign In to view your profile</h2>
        </div>
        <div className='box' style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} >
            <Field value={id} onChangeText={value => setID(value)} onSubmit={() => ref.current.focus()} placeholder={'Enter username or email'} />
            <Field value={password} reference={ref} onChangeText={value => setPassword(value)} onSubmit={submit} placeholder={'Enter password'} />
        </div>
        <div className='box' style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
            <Button onPress={submit} label={'Sign In'} />
            <p>Don't have an account? <Link to="/signup" >Sign Up</Link></p>
            <Alert content={alert} onDismiss={() => setAlert('')} />
        </div>
    </div>
}

export default SignIn;