import React, { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
// import RecordRTC, { invokeSaveAsDialog } from 'recordrtc';

const SocketContext = createContext();

const socket = io("https://backend.eatcoast.ca",{ transports : ['websocket'] });
// const socket = io("localhost:7777",{ transports : ['websocket'] });

const ContextProvider = ({ children }) => {
	const [callAccepted, setCallAccepted] = useState(false);
	const [callEnded, setCallEnded] = useState(false);
	const [stream, setStream] = useState();
	const [name, setName] = useState("");
	const [call, setCall] = useState({});
	const [me, setMe] = useState("");

	const myVideo = useRef();
	const userVideo = useRef();
	const connectionRef = useRef();

	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({audio: {
				autoGainControl: false,
				channelCount: 2,
				echoCancellation: true,
				latency: 0,
				noiseSuppression: false,
				VoiceActivityDetection:false,
				sampleRate: 48000,
				sampleSize: 16,
				volume: 1.0
			   } })
			.then(async (currentStream) => {
				// let rec = new RecordRTC(currentStream, {
				// 	type: 'audio'
				//  });
				setStream(currentStream);
				myVideo.current.srcObject = currentStream;
				
				// rec.startRecording();
				
					
				// const sleep = m => new Promise(r => setTimeout(r, m));
				// await sleep(30000);
			  
				// rec.stopRecording(function() {
				// 	let blob = rec.getBlob();
				// 	invokeSaveAsDialog(blob);
				// });
			});

		socket.on("me", (id) => setMe(id));

		socket.on("callUser", ({ from, name: callerName, signal }) => {
			console.log({ from, name: callerName, signal })
			setCall({ isReceivingCall: true, from, name: callerName, signal });
		});
		socket.on("callRec", (data) => {
			if(data && data.from.from==call.from){
				setCall({ isReceivingCall: false, from:null, name: null,callerName:null, signal:null });
			}
		});
	}, []);

	const answerCall = () => {
		setCallAccepted(true);

		const peer = new Peer({ initiator: false, trickle: false, stream });

		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: call.from });
			console.log("call.from",call.from);
			socket.emit("callRec", {from: call.from });
		});

		peer.on("stream", (currentStream) => {
			userVideo.current.srcObject = currentStream;
		});

		peer.signal(call.signal);

		connectionRef.current = peer;
	};

	const callUser = (id) => {
		const peer = new Peer({ initiator: true, trickle: false, stream });

		peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				name:"Nouman",
				from:"12345678"
			});
		});

		peer.on("stream", (currentStream) => {
			userVideo.current.srcObject = currentStream;
		});

		socket.on("callAccepted", (signal) => {
			setCallAccepted(true);

			peer.signal(signal);
		});

		connectionRef.current = peer;
	};

	const leaveCall = () => {
		setCallEnded(true);

		connectionRef.current.destroy();

		window.location.reload();
	};
	return (
		<SocketContext.Provider
			value={{
				call,
				callAccepted,
				myVideo,
				userVideo,
				stream,
				name,
				setName,
				callEnded,
				me,
				callUser,
				leaveCall,
				answerCall,
			}}
		>
			{children}
		</SocketContext.Provider>
	);
};

export { ContextProvider, SocketContext };
