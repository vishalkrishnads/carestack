import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import './styles.css'

const Home = () => {

    const [creds, setCreds] = React.useState({})
    const navigate = useNavigate();

    React.useEffect(() => {
        if (typeof (Storage) !== "undefined") {
            let data = localStorage.getItem("carestack_creds");
            if (data === null || data === undefined) navigate('/signin')
            else setCreds(JSON.parse(data))
        } else {
            alert('Sorry. The project likely wont run on this browser because its too old. Please try with a newer version.')
        }
    }, [navigate])

    const logout = () => {
        localStorage.removeItem("carestack_creds");
        navigate('/signin')
    }

    const Friend = ({ friend }) => {
        return <div className='friend'>
            <div className='image'>
                <div className='pic'>
                    <p>{friend.name.replace(/^"|"$/g, '').charAt(0)}</p>
                </div>
            </div>
            <div className='details'>
                <h2>{friend.name.replace(/^"|"$/g, '')}</h2>
                <h3>{friend.username.replace(/^"|"$/g, '')}</h3>
            </div>
            <div className='actions'>
                <p>Unfriend</p>
            </div>
        </div>
    }

    return <div className='home'>
        <div className='search'>
            <input className='field' onClick={() => console.log('Searching')} placeholder='Search for everyone' />
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
                    <h3 id='browse' style={{ color: '#086868' }}>Browse others {'>'}</h3>
                </div>
            </div>
            {creds.friends && creds.friends.length > 0 ? <div className='list'>
                {creds.friends.map((item, index) => {
                    return <Friend key={index} friend={item} />
                })}
            </div> : <div className='list empty' >
                <p>Nothing to show here</p>
                </div>}
        </div>
    </div>
}

export default Home;