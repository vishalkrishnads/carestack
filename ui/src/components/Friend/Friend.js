import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import './styles.css'

const Friend = ({ friend, isFriend, onAction, isMe }) => {
    const navigate = useNavigate();
    return <div onClick={() => navigate(isMe ? '/home' : `/profile/${friend.username.replace(/^"|"$/g, '')}`)} className='friend'>
        <div className='image'>
            <div className='pic'>
                <p>{friend.name.replace(/^"|"$/g, '').charAt(0)}</p>
            </div>
        </div>
        <div className='details'>
            <h2>{friend.name.replace(/^"|"$/g, '')}</h2>
            <h3>{friend.username.replace(/^"|"$/g, '')}</h3>
        </div>
        {isMe ? <div className='actions'>
            <h4>you</h4>
        </div> : <div className='actions'>
            {onAction ? <p onClick={onAction} style={{ color: isFriend ? '#f44336' : '#086868' }} >{isFriend ? 'Unfriend' : 'Friend'}</p> :
                <h4>{isFriend ? 'your friend' : ''}</h4>}
        </div>}
    </div >
}

export default Friend