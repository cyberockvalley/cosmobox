
import { useRouter } from "next/router";
import ImageView from "../ImageView";
import Loading from "../Loading";


const MessageListItem = ({type, text, time, pointer, showSending}) => {

  const router = useRouter()
  if(showSending) {
    return (
      <div className={`msg-item w-100 d-flex mb-3 justify-content-end`}>
        <div style={{width: "20%"}}>
          <Loading
            type={Loading.TYPES.threeDots}
            color="#fea136"
            height={10}
            visible={true}
          />
        </div>
      </div>
    )
  }
  return (
    <div className={`msg-item w-100 d-flex mb-3 ${type == "sender"? "justify-content-end" : ""}`}>
      <div style={{width: "60%"}} className="m-2">
        
        <div className={`${type} d-flex  flex-column`}>
          {
            !pointer? null :
            <div onClick={() => router.push(pointer.link)} className="d-nones mr-1 action d-flex pb-1" style={{position: "relative"}}>
              <div>
                <ImageView isDefaultHost src={pointer.image} width={60} height={60} />
              </div>
              <div className=".small p-1 more-text">{pointer?.title}</div>
              <div style={{position: "absolute", zIndex: 1, background: "rgba(0,0,0,.3)", width: "100%", height: "100%"}}></div>
            </div>
          }
          <div className="message-text">{text}</div>
          <div className="d-flex justify-content-end align-items-end">
            <div className="message-time">{time}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageListItem;