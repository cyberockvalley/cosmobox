//Thanks to https://github.com/ooade/use-fetch-hook/blob/master/src/hooks.js
import { useEffect, useRef, useReducer, useState } from 'react';

export const useFetch = (requestUrl, initialData) => {
    const cache = useRef({});
    
    const [url, setUrl] = useState(requestUrl)
    
    const initialState = [initialData || null, null, 'idle', setUrl]

	const [state, dispatch] = useReducer((state, action) => {
		switch (action.type) {
			case 'FETCHING':
                initialState[2] = 'fetching'
				return [ initialState[0], initialState[1], 'fetching', initialState[3] ];
			case 'FETCHED':
				return [ action.payload, initialState[1], 'fetched', initialState[3] ];
			case 'FETCH_ERROR':
				return [ initialState[0], action.payload, 'error', initialState[3] ];
			default:
				return state;
		}
	}, initialState);

	useEffect(() => {
		let cancelRequest = false;
		if (!url) return;

		const fetchData = async () => {
			dispatch({ type: 'FETCHING' });
			if (cache.current[url]) {
				const data = cache.current[url];
				dispatch({ type: 'FETCHED', payload: data });
			} else {
				try {
					const response = await fetch(url);
					const data = await response.json();
					
                    if (cancelRequest) return;
                    if(response.status > 299) {
                        dispatch({ type: 'FETCH_ERROR', payload: data });

                    }  else {
						cache.current[url] = data;

                        dispatch({ type: 'FETCHED', payload: data });
                    }
				} catch (error) {
					if (cancelRequest) return;
					dispatch({ type: 'FETCH_ERROR', payload: error.message });
				}
			}
		};

		fetchData();

		return function cleanup() {
			cancelRequest = true;
		};
	}, [url]);

	return state;
};