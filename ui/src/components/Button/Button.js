import * as React from 'react';
import './styles.css';

const Button = ({ label, onPress }) => {
    return <div onClick={onPress} className='button'>
        <p>{label}</p>
    </div>
}

export default Button;