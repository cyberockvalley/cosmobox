import { useState } from "react";
import Swal from "sweetalert2";
import i18n from "../../i18n";
import { RANKS_PERMISSIONS } from "../../utils/constants";
import SwalForm from "../../utils/SwalForm";


const Editor = ({maxLength, onSend, chat, sender, t}) => {
  const [message, setMessage] = useState("")

  const sendMessage = () => {
    if(message.length > 0) {
      if(chat.is_general) {
        if(!RANKS_PERMISSIONS.general_messaging.includes(sender.rank)) return
        var fields = []
        i18n.locales.forEach((locale, index) => {
          fields.push({
            id: locale == i18n.defaultLocale? "defaultMsg" : locale,
            placeholder: t('provide-message-version', {version: i18n.localesNames[index]}),
            required: t('provide-message-version-error', {version: i18n.localesNames[index]}),
            isTextArea: true,
            rows: 3,
            value: locale == i18n.defaultLocale? message : ""
          })
        })
        SwalForm.fire({
          title: t('provide-message-versions'),
          formFields: fields,
          showCancelButton: true,
          cancelButtonText: t('common:cancel'),
          confirmButtonText: t('common:submit')
        })
        .then(result => {
          console.log("SwalForm:", "result:", result)
          if(result.value) {
            onSend(result.value)
            setMessage("")
          }
        })

      } else {
        onSend({defaultMsg: message})
        setMessage("")
      }
    }
  }

  return (
    <div className={`row reply ${chat.is_general && !RANKS_PERMISSIONS.general_messaging.includes(sender.rank)? "d-none" : ""}`}>
      <div className="col-sm-1 col-1 reply-emojis d-none">
        <i className="fa fa-smile-o fa-2x" />
      </div>
      <div className="col-sm-9 col-9 reply-main">
        <textarea
          className="form-control"
          rows={1}
          value={message}
          onChange={e => {
            console.log("Editor:", "onChange", e.target.value, message)
            if(e.target.value.length <= maxLength) {
              setMessage(e.target.value)
              console.log("Editor:", "onChangeSet", e.target.value, message)
            }
          }}
        />
      </div>
      <div className="col-sm-1 col-1 reply-recording opacity-0">
        <i className="fa fa-microphone fa-2x" aria-hidden="true" />
      </div>
      <div className="col-sm-1 col-1 reply-send" onClick={sendMessage}>
        <i className="fa fa-send fa-2x" aria-hidden="true" />
      </div>
    </div>
  );
}

export default Editor;
