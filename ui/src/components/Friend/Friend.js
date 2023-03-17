import * as React from 'react'
import './styles.css'

const Friend = ({ friend, isFriend, onAction }) => {
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
            <p onClick={onAction} style={{ color: isFriend ? '#f44336' : '#086868' }} >{isFriend ? 'Unfriend' : 'Friend'}</p>
        </div>
    </div >
}

export default Friend