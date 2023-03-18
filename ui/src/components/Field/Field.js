import * as React from 'react'
import './styles.css'

const Field = ({ placeholder, onChangeText, onSubmit, value, reference }) => {
    return <input className='field' ref={reference} onKeyDown={event => { if (event.key === 'Enter') onSubmit() }} value={value} onInput={e => onChangeText(e.target.value)} placeholder={placeholder} />
}

export default Field;
