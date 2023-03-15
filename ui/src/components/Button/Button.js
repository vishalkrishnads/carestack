import * as React from 'react';
import './styles.css';

const Button = ({ label }) => {
    return <div className='button'>
        <p>{label}</p>
    </div>
}

export default Button;