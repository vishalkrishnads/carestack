import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import Alert from '../../components/Alert/Alert';
import Friend from '../../components/Friend/Friend';
import Picker from '../../components/Picker/Picker';
import defaults from '../../configs'
import './styles.css'

const Mutual = () => {

    const location = useLocation()
    const [showPicker, setPicker] = React.useState(false)
    const [compareWith, setCompare] = React.useState(location.state)
    const [user1, setUser1] = React.useState(location.state || {})
    const [user2, setUser2] = React.useState({})
    const [me, setMe] = React.useState({})
    const [results, setResults] = React.useState([])
    const [alert, setAlert] = React.useState('')

    const navigate = useNavigate();

    const onPick = async (friend) => {
        setResults([])
        if (user1 === compareWith) setUser2(friend)
        else setUser1(friend);
        setPicker(false)

        try {
            console.log(JSON.stringify({
                user1: user1._id,
                user2: user2._id
            }))
            const response = await fetch(`${defaults.BASE_URL}${defaults.endpoints.mutual}`, {
                method: 'POST',
                headers: new Headers(),
                body: JSON.stringify({
                    user1: user1 !== compareWith ? friend._id : user1._id,
                    user2: user1 === compareWith ? friend._id : user2._id
                })
            });

            if (response.ok) {
                const json = await response.json()
                setResults(json.mutual_friends)
            }
            else {
                const errorBody = await response.json();
                throw new Error(errorBody.error);
            }
        } catch (error) { setAlert(error.message) }
    }

    React.useEffect(() => {
        if (typeof (Storage) !== "undefined") {
            let data = localStorage.getItem("carestack_creds");
            if (data === null || data === undefined) navigate('/signin')
            else setMe(JSON.parse(data))
        }
    }, [])

    return <div className='mutual'>
        <div className='contestants'>
            <div className='margin' />
            <div className='user one'>
                <div style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className='pic' ><p>{user1.name ? user1.name.replace(/^"|"$/g, '').charAt(0) : '?'}</p></div>
                </div>
                <div style={{ flex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                    {user1.name ? <h2>{user1.name.replace(/^"|"$/g, '')}</h2> : null}
                    {user1.username ? <h3>{user1.username.replace(/^"|"$/g, '')}</h3> : null}
                    <h4 onClick={() => { setCompare(user2); setPicker(true) }}>{user1.name ? 'Change' : 'Choose someone'}</h4>
                </div>
            </div>
            <div className='user two'>
                <div style={{ flex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
                    {user2.name ? <h2>{user2.name.replace(/^"|"$/g, '')}</h2> : null}
                    {user2.username ? <h3>{user2.username.replace(/^"|"$/g, '')}</h3> : null}
                    <h4 onClick={() => { setCompare(user1); setPicker(true) }}>{user2.name ? 'Change' : 'Choose someone'}</h4>
                </div>
                <div style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className='pic' ><p>{user2.name ? user2.name.replace(/^"|"$/g, '').charAt(0) : '?'}</p></div>
                </div>
            </div>
            <div className='margin' />
        </div>
        <div className='info'>
            <h2>{(user1.name && user2.name) ? results.length > 0 ? 'These people are mutually friends with...' : 'These people have no mutual friends' : 'Select two people to view mutual friends' }</h2>
        </div>
        <div className='mutuals'>
            {results.map((item, index) => {
                return <Friend key={index} friend={item} isMe={me._id === item._id["$oid"]} isFriend={me.friends.includes(item._id["$oid"])} />
            })}
        </div>
        {showPicker ? <Picker compareWith={compareWith} onSelect={friend => onPick(friend)} onDismiss={() => setPicker(false)} /> : null}
        <Alert content={alert} onDismiss={() => setAlert('')} />
    </div>
}

export default Mutual;