
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Tabs, Tab, TabPanel, TabList } from 'react-web-tabs';
import Link from '../../views/Link';
import Photos from './Photos';
import Products from './Products';

import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import ImageView from '../../views/ImageView';

//import '../../public/res/css/HomeTab.css';

const FILTERS = ["trending", "new"]

const HomeTab = ({cats, catsPosts, viewer}) => {
    const { t } = useTranslation('home')
    const router = useRouter()

    const [loading, setLoading] = useState(true)

    const [catsState, setCatsState] = useState(cats || [])
    useEffect(() => {
      setCatsState(cats)
    }, [cats])

    const [catsPostsState, setCatsPostsState] = useState(catsPosts)
    useEffect(() => {
      setLoading(false)
      setCatsPostsState(catsPosts)
    }, [catsPosts])

    const [viewerState, setViewerState] = useState(viewer)
    useEffect(() => {
      setViewerState(viewerState)
    }, [viewer])

    const [filter, setFilter] = useState(FILTERS[0])

    const [catBoardDisplay, setCatBoardDisplay] = useState('')
    useEffect(() => {
      //console.log("catBoard:", catBoardDisplay)
    }, [catBoardDisplay])

    const [activeTab, setActiveTab] = useState(router.query.cat || cats[0]?.text_id)

    
    useEffect(() => {
      setLoading(true)
      router.push(activeTab == cats[0]?.text_id? "/" : `/cats/${activeTab}`)
    }, [activeTab])

    const handleTabClick = textId => {
      setActiveTab(textId)
    }
 
    const scrollRef = useBottomScrollListener(() => {
      //router
    }, {offset: 400});

    console.log("CatsState:", catsState)
    return (
      <div className={``}>
        <ul style={{height: 55}} className="nav nav-tabs nav-fills justify-content-around align-items-center ofx-auto ofy-hidden flex-nowrap" id="cats" role="tablist">
          {
            !catsState? null :
            catsState.map((cat, index) => {
              return (
                <li className="nav-item" onMouseEnter={() => setCatBoardDisplay(cat.text_id)} onMouseLeave={() => setCatBoardDisplay('')}>
                  <div style={{position: 'relative'}}>
                    <a onClick={() => handleTabClick(cat.text_id)} className={`nav-link ${(index == 0 && !activeTab) || activeTab == cat.text_id? 'active' : ''}`} id={`${cat.text_id}-tab`} data-toggle="tab" href={`${index == 0? '/' : `/cats/${cat.text_id}`}`} role="tab" aria-controls={cat.text_id} aria-selected="true">{cat.name}</a>
                  </div>
                  <div style={{position: 'absolute', top: 50, left: 0, zIndex: 5}} className={`row mx-0 p-1 w-100 d-flex justify-content-center ${catBoardDisplay == cat.text_id && !cat.is_custom? '' : 'd-none'}`}>
                      <div className="row card flex-row col-md-8 px-0" style={{height: '300px', position: 'relative'}}>
                        <div className="flex p-2 w-100 d-md-none">
                          <div onClick={() => setCatBoardDisplay('')} className="action fa fa-2x fa-times"></div>
                        </div>
                        <div className="d-flex flex-row ofy-auto ">
                          <div className="col-md-5 d-flex align-items-center">
                            <ul className="row" style={{fontSize: '14px'}}>
                            {
                              cat?.subcats.map((subcat, index) => {
                                return <li className="col-6">
                                  <Link key={subcat.text_id} className="text-secondary text-hover-underline" href={`/group/all/${cat.text_id}/${subcat.text_id}`}>
                                    {subcat.name}
                                  </Link>
                                </li>
                              })
                            }
                            </ul>
                          </div>
                          <div style={{display: 'none'}} className="col-md-7 d-md-flex align-items-center">
                            <ImageView isDefaultHost src="/600X250.png" width={600} height={250} />
                          </div>
                        </div>
                      </div>
                  </div>
                </li>
              )
            })
          }
        </ul>
        <hr className="my-0" />
        <div className="tab-content container pt-3" id="catsContent">
          {
            catsState.map((cat, index) => {
              return (
                <div className={`tab-pane fade ${(index == 0 && !activeTab) || activeTab == cat.text_id? 'show active' : ''}`} id={cat.text_id} role="tabpanel" aria-labelledby={`${cat.text_id}-tab`}>
                  <Products loading={loading} ref={scrollRef} products={catsPostsState[cat.text_id] || []} viewer={viewerState} />
                </div>
              )
            })
          }
        </div>
        <style jsx>{`
        html {
          --scrollbarBG: #CFD8DC;
          --thumbBG: #90A4AE;
        }
        /* width */
        .nav::-webkit-scrollbar {
          height: 5px;
        }

        /* Track */
        .nav::-webkit-scrollbar-track {
          box-shadow: inset 0 0 5px #CFD8DC; 
        }
        
        /* Handle */
        .nav::-webkit-scrollbar-thumb {
          background: #90A4AE; 
          border-radius: 5px;
        }

        /* Handle on hover */
        .nav::-webkit-scrollbar-thumb:hover {
          background: #90A4AE; 
        }
        `}</style>
      </div>
    )
}

export default HomeTab