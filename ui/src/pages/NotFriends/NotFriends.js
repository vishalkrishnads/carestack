import * as React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Friend from '../../components/Friend/Friend'
import Alert from '../../components/Alert/Alert'
import defaults from '../../configs'
import './styles.css'

const NotFriends = () => {

    let [notFriends, setData] = React.useState([]);
    let [alert, setAlert] = React.useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const ID = React.useRef('');

    const load = async (id) => {
        try {
            ID.current = id;
            const response = await fetch(`${defaults.BASE_URL}${defaults.endpoints.notfriends}`, {
                method: 'POST',
                headers: new Headers(),
                body: JSON.stringify({
                    "me": id
                })
            });

            if (response.ok) {
                const json = await response.json();
                let temp = []
                for (const each of json.results) temp.push(each)
                setData(temp)
            } else {
                const errorBody = await response.json();
                throw new Error(errorBody.error);
            }
        } catch (error) { setAlert(error.message) }
    }

    const friend = async(friend) => {
        try {
            const response = await fetch(`${defaults.BASE_URL}${defaults.endpoints.friend}`, {
                method: 'POST',
                headers: new Headers(),
                body: JSON.stringify({
                    "me": ID.current,
                    "friend": friend._id["$oid"]
                })
            });

            if (response.ok) {
                const json = await response.json();
                setData(prevState => prevState.filter(item => item !== friend))
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
            else load(JSON.parse(data)._id)
        } else {
            setAlert('Sorry. The project likely wont run on this browser because its too old. Please try with a newer version.')
        }
    }, [location])

    return <div className='notfriends'>
        <div className='search'>
            <input className='field' onClick={() => console.log('Searching')} placeholder='Search for everyone' />
        </div>
        <div className='thing'>
            <div className='head'>
                <h3>Everyone you aren't friends with</h3>
            </div>
            {notFriends && notFriends.length > 0 ? <div className='list'>
                {notFriends.map((item, index) => {
                    return <Friend onAction={() => friend(item)} isFriend={false} key={index} friend={item} />
                })}
            </div> : <div className='list empty' >
                <p>Nothing to show here</p>
            </div>}
            <Alert content={alert} onDismiss={() => setAlert('')} />
        </div>
    </div>
}

export default NotFriends;