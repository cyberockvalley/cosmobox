import ImageView from "../ImageView";

export default function Carousel({children, images, className, onDimension, title}){

    return (
        <div>
            <div className={`container p-0 m-0 ${className || ''}`}>
                <div className="row p-0 m-0">
                    <div className="col-12 p-0 m-0">
                        <div id="custCarousel" className="carousel slide" data-ride="carousel" align="center">
                            <div className="carousel-inner">
                                {
                                    images.map((image, index) => (
                                        <div className="d-flex justify-content-center align-items-center product-carousel" key={index} className={`carousel-item ${index == 0? 'active' : ''}`}> 
                                            <ImageView isDefaultHost width={400} height={400} className="w-auto h-100" src={image} alt={title || ""} /> 
                                        </div>
                                    ))
                                }
                            </div>
                            <div style={{position: 'absolute', zIndex: 1, top: 0, right: 0}}>
                                {children}
                            </div>
                            <a className="carousel-control-prev" href="#custCarousel" data-slide="prev"> 
                                <span className="carousel-control-prev-icon"></span> 
                            </a> 
                            <a className="carousel-control-next" href="#custCarousel" data-slide="next"> 
                                <span className="carousel-control-next-icon"></span> 
                            </a>
                            <ol className="d-flex list-inline p-0 m-0 my-3">
                                {
                                    images.map((image, index) => (
                                        <li key={index} className={`list-inline-item ${index == 0? 'active' : ''}`}> 
                                            <a id={`carousel-selector-${index}`} className="selected" data-slide-to={index} data-target="#custCarousel"> 
                                                <ImageView isDefaultHost width={110} height={110} src={image} alt={title || ""} />
                                            </a> 
                                        </li>
                                    ))
                                }
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
            .container {
                margin: 15px 0px;
            }
            
            .carousel-inner img {
                width: 100%;
                height: 100%
            }
            
            #custCarousel .carousel-indicators {
                position: static;
                margin-top: 20px
            }
            
            #custCarousel .carousel-indicators>li {
                width: 100px
            }
            
            #custCarousel .carousel-indicators li img {
                display: block;
                opacity: 0.5
            }
            
            #custCarousel .carousel-indicators li.active img {
                opacity: 1
            }
            
            #custCarousel .carousel-indicators li:hover img {
                opacity: 0.75
            }
            
            .carousel-item img {
                width: 80%
            }
            `}</style>
        </div>
    )
}