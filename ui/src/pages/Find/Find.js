import * as React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Friend from '../../components/Friend/Friend'
import Alert from '../../components/Alert/Alert'
import defaults from '../../configs'
import './styles.css'

const Find = () => {

    let [query, setQuery] = React.useState('')
    let [results, setResults] = React.useState([])
    let [friends, setFriends] = React.useState([])
    let [alert, setAlert] = React.useState('')

    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        if (typeof (Storage) !== "undefined") {
            let data = localStorage.getItem("carestack_creds");
            if (data === null || data === undefined) navigate('/signin')
            else {
                let temp = []
                for (const each of JSON.parse(data).friends) temp.push(each._id["$oid"])
                setFriends(temp)
            }
        } else {
            setAlert('Sorry. The project likely wont run on this browser because its too old. Please try with a newer version.')
        }
    }, [location])

    React.useEffect(() => {
        if(!query) setResults([])
    }, [query])

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
        } catch (error) { setAlert(error.message) }
    }

    return <div className='find'>
        <div className='search'>
            <input className='field' value={query} onInput={event => { setQuery(event.target.value); search() }} placeholder='Search for everyone' />
        </div>
        <div className='thing'>
            <div className='head'>
                <h3>{query ? 'People or accounts matching your search' : results.length > 0 ? 'Suggestions for you' : 'Type something to search or * to view everyone' }</h3>
            </div>
            {results && results.length > 0 ? <div className='list'>
                {results.map((item, index) => {
                    return <Friend isFriend={friends.includes(item._id["$oid"])} key={index} friend={item} />
                })}
            </div> : <div className='list empty' >
                <p>Nothing to show here</p>
            </div>}
            <Alert content={alert} onDismiss={() => setAlert('')} />
        </div>
    </div>
}

export default Find;
