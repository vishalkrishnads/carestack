import * as React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Friend from '../../components/Friend/Friend'
import Alert from '../../components/Alert/Alert'
import defaults from '../../configs'
import './styles.css'

const Home = () => {

    const [creds, setCreds] = React.useState({})
    const [friends, setFriends] = React.useState([])
    const [alert, setAlert] = React.useState('')
    const navigate = useNavigate();
    const location = useLocation();

    const refresh = async(username) => {
        try {
            const response = await fetch(`${defaults.BASE_URL}${defaults.endpoints.getProfile}/${username || creds.username}`, {
                method: 'GET',
                headers: new Headers()
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
                setFriends(json.friends)
            } else {
                const errorBody = await response.json();
                throw new Error(errorBody.error);
            }
        } catch (error) { setAlert(error.message) }
    }

    React.useEffect(() => {
        if (typeof (Storage) !== "undefined") {
            let data = localStorage.getItem("carestack_creds");
            if (data === null || data === undefined) navigate('/signin')
            else {
                setCreds(JSON.parse(data))
                setFriends(JSON.parse(data).friends)
                refresh(JSON.parse(data).username);
            }
        } else {
            setAlert('Sorry. The project likely wont run on this browser because its too old. Please try with a newer version.')
        }
    }, [location])

    const unfriend = async(friend) => {
        try {
            const response = await fetch(`${defaults.BASE_URL}${defaults.endpoints.unfriend}`, {
                method: 'POST',
                headers: new Headers(),
                body: JSON.stringify({
                    "me": creds._id,
                    "friend": friend._id["$oid"]
                })
            });

            if (response.ok) {
                const json = await response.json();
                setFriends(prevState => prevState.filter(item => item !== friend))
            } else {
                const errorBody = await response.json();
                throw new Error(errorBody.error);
            }
        } catch (error) { setAlert(error.message) }
    }

    const logout = () => {
        localStorage.removeItem("carestack_creds");
        navigate('/signin')
    }

    return <div className='home'>
        <div className='search'>
            <input className='field' onClick={() => navigate('/search')} placeholder='Search for everyone' />
        </div>
        <div className='myprofile'>
            <div className='image'>
                {creds.name ? <div className='pic'>
                    <h1>{creds.name.charAt(0)}</h1>
                </div> : null}
            </div>
            <div className='margin' />
            <div className='details'>
                <h1>{creds.name}</h1>
                <h2>{creds.username}</h2>
                <textarea placeholder='Add a bio' className='bio' />
                <h3 onClick={logout}>Sign Out</h3>
            </div>
        </div>
        <div className='friends'>
            <div className='head'>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <h3>Your friends</h3>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <h3 id='browse' onClick={() => navigate('/notfriends')} style={{ color: '#086868' }}>Browse others {'>'}</h3>
                </div>
            </div>
            {friends.length > 0 ? <div className='list'>
                {friends.map((item, index) => {
                    return <Friend onAction={() => unfriend(item)} isFriend key={index} friend={item} />
                })}
            </div> : <div className='list empty' >
                <p>Nothing to show here</p>
                </div>}
                <Alert content={alert} onDismiss={() => setAlert('')} />
        </div>
    </div>
}

export default Home;