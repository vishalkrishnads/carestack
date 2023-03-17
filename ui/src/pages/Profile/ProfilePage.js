import * as React from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Alert from '../../components/Alert/Alert';
import Loader from '../../components/Loader/Loader'
import Friend from '../../components/Friend/Friend';
import defaults from '../../configs'
import './styles.css'

const Profile = () => {

    const { handle } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [creds, setCreds] = React.useState({})
    const [me, setMe] = React.useState({})
    const [friends, setFriends] = React.useState([])
    const [isFriend, setFriend] = React.useState(false)
    const [alert, setAlert] = React.useState('')

    React.useEffect(() => {
        const refresh = async () => {
            if (typeof (Storage) !== "undefined") {
                let data = localStorage.getItem("carestack_creds");
                if (data === null || data === undefined) navigate('/signin')
                else {
                    let temp = []
                    for (const each of JSON.parse(data).friends) {
                        if (each.username.replace(/^"|"$/g, '') === handle) setFriend(true)
                        temp.push(each._id["$oid"])
                    }
                    setMe({
                        ...JSON.parse(data),
                        friends: temp
                    })
                }
            }
            try {
                const response = await fetch(`${defaults.BASE_URL}${defaults.endpoints.getProfile}/${handle || creds.username}`, {
                    method: 'GET',
                    headers: new Headers()
                });

                if (response.ok) {
                    const json = await response.json();
                    setCreds({
                        _id: json.uid["$oid"],
                        name: json.name.replace(/^"|"$/g, ''),
                        email: json.email.replace(/^"|"$/g, ''),
                        username: json.username.replace(/^"|"$/g, ''),
                        bio: json.bio.replace(/^"|"$/g, ''),
                    })
                    setFriends(json.friends)
                } else {
                    const errorBody = await response.json();
                    throw new Error(errorBody.error);
                }
            } catch (error) { setAlert(error.message) }
        }
        refresh()
    }, [location])

    const onFriendAction = async () => {
        try {
            const response = await fetch(`${defaults.BASE_URL}${isFriend ? defaults.endpoints.unfriend : defaults.endpoints.friend}`, {
                method: 'POST',
                headers: new Headers(),
                body: JSON.stringify({
                    me: me._id,
                    friend: creds._id
                })
            });

            if (response.ok) setFriend(prev => !prev)
            else {
                const errorBody = await response.json();
                throw new Error(errorBody.error);
            }
        } catch (error) { setAlert(error.message) }
    }

    return <div className='profile'>
        <div className='search'>
            <input className='field' onClick={() => navigate('/search')} placeholder='Search for everyone' />
        </div>
        {creds.name ? <div className='user'>
            <div className='image'>
                {creds.name ? <div className='pic'>
                    <h1>{creds.name.charAt(0)}</h1>
                </div> : null}
            </div>
            <div className='margin' />
            <div className='details'>
                <h1>{creds.name}</h1>
                <h2>{handle}</h2>
                <textarea value={creds.bio || ''} disabled className='bio' />
                <h3 style={{ color: isFriend ? '#f44336' : '#086868' }} onClick={onFriendAction}>{isFriend ? 'Unfriend' : 'Friend'}</h3>
            </div>
        </div> : <div className='user'>
            <Loader />
        </div>}
        <div className='friends'>
            <div className='head'>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <h3 id='header'>{creds.name ? `${creds.name.split(" ")[0]}'s friends` : 'Friends'}</h3>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <h3 id='browse' onClick={() => navigate('/mutual', {state: creds})} style={{ color: '#086868' }}>View mutual {'>'}</h3>
                </div>
            </div>
            {friends.length > 0 ? <div className='list'>
                {friends.map((item, index) => {
                    return <Friend isMe={me._id === item._id["$oid"]} isFriend={me.friends.includes(item._id["$oid"])} key={index} friend={item} />
                })}
            </div> : <div className='list empty' >
                <p>Nothing to show here</p>
            </div>}
            <Alert content={alert} onDismiss={() => setAlert('')} />
        </div>
    </div>
}

export default Profile;