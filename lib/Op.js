const Op = {
	// message encryption type
	MSG_CIPHER_PLAINTEXT :0,
	MSG_CIPHER_CRYPTODOG :1,
	MSG_CIPHER_PHOXY     :2,
	
	// Storage access control flags
	FLAG_PUBLIC_ACCESS  :0x01,
	FLAG_PRIVATE_ACCESS :0x02,
	FLAG_PEER_ACCESS    :0x04,
	
	// Client opcodes
	CMD_SUBSCRIBE       :0x0000,
	CMD_UNSUBSCRIBE     :0x0001,
	CMD_STORE_DATA      :0x0002,
	CMD_FETCH_DATA      :0x0003,
	CMD_PUBLISH_MESSAGE :0x0004,
	
	// Server opcodes
	CMD_CONNECTION_ESTABLISHED :0x0001,
	CMD_REQUEST_RESPONSE       :0x1000,
	CMD_INCOMING_MESSAGE       :0x1001,
	CMD_SUBSCRIBE_ALERT        :0x1002,
	CMD_UNSUBSCRIBE_ALERT      :0x1002,
	CMD_PEER_NEW_DEVICE        :0x1003,
	
	// HTTP api ops
	CANNOT_CONNECT  :0,
	SUCCESS         :1,
	FAIL            :2,
	RATE_LIMITED    :3,
	NAME_IN_USE     :4,
	CAPTCHA_FAILED  :5,
	ACCOUNT_LOCKED  :6,
	NAME_INVALID    :7,
	NO_SUCH_ENTITY  :8,
	VERSION_INVALID :9,
	
	DATA_FOUND        :0,
	DATA_NOT_FOUND    :1,
	DATA_UNAUTHORIZED :2,
	
	// PHOXY envelope header
	PHOXY_SESSION_INIT    :1,
	PHOXY_SESSION_DATA    :2,
	PHOXY_SESSION_DESTROY :3,
	
	// PHOXY envelope flags
	PHOXY_FLAG_MAP         :1 << 1,
	PHOXY_FLAG_MESSAGE_KEY :1 << 2,
	
	// PHOXY decrypted message headers
	PHOXY_CONTAINER_TEXT_MESSAGE   :1,
	PHOXY_CONTAINER_INIT_TELEPHONY :2
};

module.exports  = Op;