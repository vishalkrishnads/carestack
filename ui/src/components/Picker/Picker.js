import * as React from 'react'
import defaults from '../../configs'
import './styles.css'

const Picker = ({ onDismiss, compareWith, onSelect }) => {

    let [query, setQuery] = React.useState('')
    let [results, setResults] = React.useState([])

    const search = async () => {
        try {
            const response = await fetch(`${defaults.BASE_URL}${defaults.endpoints.search}`, {
                method: 'POST',
                headers: new Headers(),
                body: JSON.stringify({
                    "query": query
                })
            });

            if (response.ok) {
                const json = await response.json();
                setResults(json.results)
            } else {
                const errorBody = await response.json();
                throw new Error(errorBody.error);
            }
        } catch { }
    }

    const Option = ({ friend, onPress }) => {
        return <div onClick={onPress} className='option'>
            <div className='image'>
                <div className='circle'><p>{friend.name.replace(/^"|"$/g, '').charAt(0)}</p></div>
            </div>
            <div className='margin' />
            <div className='details'>
                <h2>{friend.name.replace(/^"|"$/g, '')}</h2>
                <h3>{friend.username.replace(/^"|"$/g, '')}</h3>
            </div>
        </div>
    }

    return <div className='picker'>
        <div className='prompt'>
            <div className='titlebar'>
                <div style={{ flex: 1 }} />
                <div style={{ flex: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <h3>Choose an account to compare</h3>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h2 onClick={onDismiss} >&times;</h2></div>
            </div>
            <div className='searchbar'>
                <input value={query} onInput={event => { setQuery(event.target.value); search() }} className='mediumsearch' placeholder='Type to search' />
            </div>
            <div style={{ flex: 0.2 }} />
            {results.length > 0 ? <div className='options'>
                {results.map((item, index) => {
                    return <Option onPress={() => onSelect({
                        ...item,
                        _id: item._id["$oid"]
                    })} friend={item} key={index} />
                })}
            </div> : <div className='options'><p style={{ color: 'grey' }}>Search for someone<br />OR<br />Type '*' to see all</p></div>}
            <div style={{ flex: 0.5 }} />
        </div>
    </div>
}

export default Picker;