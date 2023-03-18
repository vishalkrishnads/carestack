import * as React from 'react'
import './styles.css'

const Alert = ({ content, onDismiss }) => {
    
    React.useEffect(() => {
        document.getElementById('alert').style.display = content ? 'block' : 'none'
    }, [content])

    return (
        <div id='alert' className="alert">
            <span className="closebtn" onClick={onDismiss}>&times;</span>
            {content}
        </div>
    )
}

export default Alert;
