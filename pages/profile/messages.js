import { getSession, signIn, useSession } from 'next-auth/client'
import useTranslation from 'next-translate/useTranslation'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { STATUS_CODES } from '../../api'
import LoadingView from '../../components/LoadingView'
import PageBody from '../../components/PageBody'
import getPageLinks from '../../hooks/page-links'
import { CHATS_PER_PAGE, CHAT_ID_SEPARATOR, GENERAL_MESSAGE_CHAT_ID, MESSAGES_PER_PAGE, MSG_EDITOR_MAX_LENGTH, NO_PROFILE_PIC, TITLE_SEPARATOR } from '../../utils/constants'
import { createChatId } from '../../utils/functions'
import ChatView from '../../views/chatview/index'
import Pagination from '../../views/Pagination'
import { API_OPTIONS } from '../api/[...v1]'

import { apiPostJson } from '../../api/client'

export default function Messages({chats, messages}) {
    const { t, lang } = useTranslation('messages')
    const router = useRouter()
    // Fetch the user client-side
    const [ session, loading ] = useSession()
    
    const [stateChats, setStateChats] = useState(chats)
    const [stateMessages, setStateMessages] = useState(messages)
    
    const [chatId, setChatId] = useState(router?.query?.chat_id)
    

    useEffect(() => {
        if(chatId) {
            router.replace(Pagination.getPageUrl(router, {chat_id: chatId}))

        } else {
            router.replace(Pagination.getPageUrl(router, {chat_id: ""}))
        }

    }, [chatId])

    useEffect(() => {
        setStateChats(chats)
    }, [chats])

    useEffect(() => {
        setStateMessages(messages)
    }, [messages])

    // Server-render loading state
    if (!session && loading) {
        return(
            <div>
                <Head>
                    <title>{t('header:messages')} {TITLE_SEPARATOR} {t('header:site-name')}</title>
                </Head>
                <PageBody navType={PageBody.vars.NAV_TYPES.others}>
                    <LoadingView title={t('header:messages')} message={t('common:fetching-user-data-message')} />
                </PageBody>
            </div>
        )
    }

    //take the user to the lofin page if the session is empty
    if (!session && !loading) {
        signIn()
    }

    const handleEditorSend = messageData => {
        console.log("SingleChatPromise", "data", messageData)
        //apiPostJson('message', {message: {defaultMsg: form.message, it: "Italy here", ru: "Russian here"}, is_general: true, to_id: sellerState.id, product_id: product.id}, lang)
       
        return apiPostJson('message', {
            message: messageData.message,
            is_general: messageData.chat.is_general,
            to_id: messageData.chat.is_general? session.user.id : messageData.chat.chatterId
        }, lang)
        .then(r => {
            return {ok: true}
        })
        .catch(e => {
            return {ok: false, error: e}
        })
    }

    // Once the user request finishes, show the user
    return (
    <div>
        <Head>
            <title>{t('header:messages')} {TITLE_SEPARATOR} {t('header:site-name')}</title>
            <link rel="stylesheet" href="/res/css/chat.min.css" media="all" />
        </Head>
        <PageBody navType={PageBody.vars.NAV_TYPES.others} excludeHeader>
            <ChatView t={t} editorMaxLength={MSG_EDITOR_MAX_LENGTH} editorSendHandler={handleEditorSend} sender={session?.user} profilePhoto={session?.user?.image || NO_PROFILE_PIC} chats={stateChats} messages={stateMessages} chatId={chatId} chatIdSetter={setChatId} />
        </PageBody>
    </div>
    )
}

export async function getServerSideProps({req, params, query, locale}) {
    console.log("MSG:", "params", params)
    console.log("MSG:", "query", query)

    const Sequelize = require("sequelize")
    const getDb = require('../../database/get-db')
    const DB = getDb(API_OPTIONS.database)
    const getTables = require('../../database/get-tables')
    const { MessageRead, User } = getTables(API_OPTIONS.database, ['MessageRead', 'User'], locale, API_OPTIONS.defaultLocale)
    
    var props = {}
    var redirect = null

    var viewer = null
    //get the viewer id
    var userId
    const session = await getSession({req})
    var user = session?.user || {}
    userId = user?.id

    if(!userId) {
        return {
            redirect: {
              destination:  getPageLinks().signInPageLink,
              permanent: false,
            }
        }

    } else {
        var page = query?.page || 1
        if(page < 1) page = 1
        var offset = (page - 1) * CHATS_PER_PAGE

        var singleChatPage = query?.single_chat_page || 1
        if(singleChatPage < 1) page = 1

        var singleChat = query.chat_id//takes chat id
        var isLangSwitch = query.is_lang_switch
        if(isLangSwitch && (isNaN(isLangSwitch) || parseInt(isLangSwitch) != 1)) isLangSwitch = false

        var noChats = query.no_chats
        if(noChats && (isNaN(noChats) || parseInt(noChats) != 1)) noChats = false

        try {
            var chats = []
            var messages = []
            
            isLangSwitch = false
            noChats = false
            if (!isLangSwitch) {
                if(!noChats) {
                    //get the chat list
                    var chatsQuery = `
                    SELECT m.*
                    FROM (SELECT 
                        messages.id AS id, 
                        messages.text AS text, 
                        messages.chat_id AS chat_id, messages.from_id AS from_id, messages.to_id AS to_id, 
                        messages.created_at AS createdAt, messages.updated_at AS updatedAt, 
                        messages.is_general AS is_general, 
                         

                        nextauth_users.id as chatterId, 
                        nextauth_users.username as chatterUsername, 
                        nextauth_users.image as chatterImage, 
                        nextauth_users.name as chatterName 
                        FROM messages, nextauth_users
                        WHERE (messages.from_id = ? AND nextauth_users.id = messages.to_id) 
                        OR (messages.to_id = ? AND nextauth_users.id = messages.from_id) 
                        ORDER BY messages.id DESC LIMIT 0, 1000000000
                    ) m 
                    GROUP BY m.chat_id ORDER BY is_general DESC, m.id DESC LIMIT 0, ?
                    `
                    chats = await DB.query(chatsQuery, {
                        replacements: [userId, userId, CHATS_PER_PAGE],
                        raw: true, 
                        type: Sequelize.QueryTypes.SELECT,
                        model: MessageRead,
                        mapToModel: true
                    }) || []
                }


                if(singleChat) {
                    //get single chat messages: this can be normal messages or general messages
                    //get the total messages of the chat
                    var totalMessages = await MessageRead.count({
                        where: Sequelize.and(
                            {chat_id: singleChat},
                            Sequelize.or(
                                {from_id: userId},
                                {to_id: userId}
                            )
                        )
                    })
                    var singleChatOffset = totalMessages - MESSAGES_PER_PAGE
                    if(singleChatOffset < 1) singleChatOffset = 0
                    
                    //get the messages now
                    //get the normal messages
                    var query = `
                    SELECT messages.id, messages.chat_id, messages.from_id, messages.to_id, messages.product_id, messages.delivered, 
                    messages.msg_read, messages.is_general, messages.created_at AS createdAt, messages.updated_at AS updatedAt,
                    ${singleChat != GENERAL_MESSAGE_CHAT_ID || locale == API_OPTIONS.defaultLocale? "messages.text" : `messages.text_${locale}` },
                     products.* 
                    FROM messages
                    LEFT OUTER JOIN (
                        SELECT products.id AS productId, products.title AS productTitle, products.photos AS productPhotos, cats.text_id AS productCatTextId, subcats.text_id AS productSubcatTextId 
                        FROM products 
                        LEFT OUTER JOIN cats ON products.cat = cats.id
                        LEFT OUTER JOIN subcats ON products.subcat = subcats.id
                    ) AS products ON messages.product_id = products.productId
                    WHERE messages.chat_id = ? LIMIT ${singleChatOffset}, ${MESSAGES_PER_PAGE}
                    `
                    messages = await DB.query(query, {
                        replacements: [singleChat],
                        raw: true, 
                        type: Sequelize.QueryTypes.SELECT,
                        model: MessageRead,
                        mapToModel: true
                    }) || []

                    //check if this is a new chat
                    //if so, the receiver will neither be in the chats list nor obviously any message
                    //so we have to check to see if it's a new chat and create add a chat placeholder
                    //to allow the user to have a new conversation directly from the messanger

                    var chatsCheckArray = []
                    if(chats) {
                        chatsCheckArray = chats.map((chat) => chat.chat_id)
                    }

                    console.log("chatCheck2:", chatsCheckArray)
                    if(!chatsCheckArray.includes(singleChat)) {
                        //now let's create a chat placeholder

                        var toChat = singleChat.split(CHAT_ID_SEPARATOR)
                        var toChatId1
                        var toChatId2

                        try {
                            toChatId1 = parseInt(toChat[0].trim())
                            toChatId2 = parseInt(toChat[1].trim())

                            var toChatId

                            if(toChatId1 == parseInt(userId)) {
                                toChatId = toChatId2

                            } else {
                                toChatId = toChatId1
                            }

                            var userCheck
                            var ranking = API_OPTIONS.ranking
                            if(singleChat != GENERAL_MESSAGE_CHAT_ID) {
                                userCheck = await User.findOne({
                                    where: {id: toChatId}
                                })

                            } else if(ranking.permissions.general_messaging.includes(session.user.rank)) {
                                userCheck = {
                                    id: session.user.id,
                                    username: session.user.username,
                                    name: session.user.name,
                                    image: session.user.image
                                }
                            }

                            if(userCheck) {
                                var chatIds = singleChat.split(CHAT_ID_SEPARATOR)
                                var chatId = createChatId(chatIds[0], chatIds[1])
                                if(chatId) {
                                    const newChat = {
                                        chat_id: chatId,
                                        chatterId: userCheck.id,
                                        chatterUsername: userCheck.username,
                                        chatterImage: userCheck.image,
                                        chatterName: userCheck.name,
                                        is_general: singleChat == GENERAL_MESSAGE_CHAT_ID
                                    }
                                    if(messages.length > 0) {
                                        chat.createdAt = messages[messages.length - 1].createdAt
                                    }
    
                                    var indexOfGeneralChat = chatsCheckArray.indexOf(GENERAL_MESSAGE_CHAT_ID)
                                    if(indexOfGeneralChat > -1) {
                                        chats.splice(indexOfGeneralChat + 1, 0, newChat)
                                        
    
                                    } else {
                                        chats = [newChat, ...chats]
                                    }
                                }
                            }
                        } catch(e) {}
                    }

                }
            }
            if(props.errorCode) {
                if(props.errorCode == STATUS_CODES.NOT_FOUND) return {notFound: true}
                return {
                    redirect: {
                        destination: `/errors/${props.errorCode}`,
                        permanent: false,
                    }
                }
        
            } else if(redirect) {
                return {
                    redirect: {
                      destination: redirect,
                      permanent: true,
                    }
                }
        
            } else {
                props = {
                    chats: chats,
                    messages: messages
                }
                props = JSON.parse(JSON.stringify(props))
                console.log("MSG:PP", props)
                return {
                    props: props
                }
            }

        } catch(e) {
            console.log("MSG::E", "SERVER_ERROR", e)
            
            return {
                redirect: {
                    destination: `/errors/${STATUS_CODES}`,
                    permanent: false,
                }
            }
        }
    }
}