import * as React from 'react'
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';

const AuthCheck = () => {

    const navigate = useNavigate();

    React.useEffect(() => {
        if (typeof (Storage) !== "undefined") {
            let creds = localStorage.getItem("carestack_creds");
            if (creds === null || creds === undefined) navigate('/signup')
            else navigate('/home')
        } else {
            alert('Sorry. The project likely wont run on this browser because its too old. Please try with a newer version.')
        }
    }, [navigate])

    return <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader />
    </div>
}

export default AuthCheck;
