
// took from https://gist.github.com/junderw/1d41158403978ba0363e5868d4f434d9
async function decrypt(ciphertext, password, difficulty = 10) {
	const ciphertextBuffer = Array.from(base64Decode(ciphertext))
	const hashKey = await grindKey(password, difficulty)

	const key = await crypto.subtle.importKey(
		'raw',
		hashKey, {
		name: 'AES-GCM',
	},
		false,
		['decrypt']
	)

	const decrypted = await crypto.subtle.decrypt({
		name: 'AES-GCM',
		iv: new Uint8Array(ciphertextBuffer.slice(0, 12)),
		tagLength: 128,
	},
		key,
		new Uint8Array(ciphertextBuffer.slice(12))
	)

	return new TextDecoder('utf-8').decode(new Uint8Array(decrypted))
}

function base64Decode(str) {
	return new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)))
}

function grindKey(password, difficulty) {
	return pbkdf2(password, password + password, Math.pow(2, difficulty), 32, 'SHA-256')
}

async function pbkdf2(message, salt, iterations, keyLen, algorithm) {
	const msgBuffer = new TextEncoder().encode(message)
	const msgUint8Array = new Uint8Array(msgBuffer)
	const saltBuffer = new TextEncoder().encode(salt)
	const saltUint8Array = new Uint8Array(saltBuffer)

	const key = await crypto.subtle.importKey('raw', msgUint8Array, {
		name: 'PBKDF2'
	}, false, ['deriveBits'])

	const buffer = await crypto.subtle.deriveBits({
		name: 'PBKDF2',
		salt: saltUint8Array,
		iterations: iterations,
		hash: algorithm
	}, key, keyLen * 8)

	return new Uint8Array(buffer)
}

const CLIENT_PAYLOAD = process.env.ENCRYPTED_CLIENT_PAYLOAD;
if (!CLIENT_PAYLOAD) {
  throw new Error("UNEXPECTED: CLIENT_PAYLOAD environment variable is not set");
}

(async () => {
  const decrypted = await decrypt(CLIENT_PAYLOAD, process.env.ENCRYPTION_PASSWORD);
  console.log(decrypted);
  console.log(JSON.parse(decrypted));
})();
