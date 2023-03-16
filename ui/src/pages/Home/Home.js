import * as React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {

    const [temp, setTemp] = React.useState({})
    const navigate = useNavigate();

    React.useEffect(() => {
        if (typeof (Storage) !== "undefined") {
            let creds = localStorage.getItem("carestack_creds");
            if (creds === null || creds === undefined) navigate('/signin')
            else setTemp(JSON.parse(creds))
        } else {
            alert('Sorry. The project likely wont run on this browser because its too old. Please try with a newer version.')
        }
    }, [navigate])

    const logout = () => {
        localStorage.removeItem("carestack_creds");
        navigate('/signin')
    }

    return <div style={{ display: 'flex', width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1>Welcome {temp.name ? temp.name : ''}</h1>
        <h2 onClick={logout}>LOGOUT</h2>
    </div>
}

export default Home;