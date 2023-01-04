import React, { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import RecordRTC, { invokeSaveAsDialog } from 'recordrtc';

const SocketContext = createContext();

const socket = io("https://backend.eatcoast.ca",{ transports : ['websocket'] });

const ContextProvider = ({ children }) => {
	const [callAccepted, setCallAccepted] = useState(false);
	const [callEnded, setCallEnded] = useState(false);
	const [stream, setStream] = useState();
	const [name, setName] = useState("");
	const [call, setCall] = useState({});
	const [me, setMe] = useState("");
	const [rec, setRec] = useState({});
	const [callRecorded, setCallRecorded] = useState(false);

	const myVideo = useRef();
	const userVideo = useRef();
	const connectionRef = useRef();

	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({audio: {
				autoGainControl: false,
				channelCount: 2,
				latency: 0,
				noiseSuppression: false,
				VoiceActivityDetection:false,
				sampleRate: 48000,
				sampleSize: 16,
				volume: 1.0,
				echoCancellation:  true,
				googEchoCancellation: true,
				googAutoGainControl:true,
				googNoiseSuppression: true,
			   } })
			.then(async (currentStream) => {
				let r = new RecordRTC(currentStream, {
					type: 'audio'
				 });
				setRec(r)
				setStream(currentStream);
				myVideo.current.srcObject = currentStream;
			});

		socket.on("me", (id) => setMe(id));

		socket.on("callUser", ({ from, name: callerName, signal }) => {
			console.log("call",{ from, name: callerName, signal })
			setCall({ isReceivingCall: true, from, name: callerName, signal });
		});


		// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);
	
	socket.on("callRec", (from) => {
		if(from===call.from){
			setCall({ isReceivingCall: false, from:null, name: null,callerName:null, signal:null });
		}
	});

	socket.on("callEnd1", (from) => {
		if(from===me){
			console.log("stop1",callRecorded)
			if(callRecorded){
				rec.stopRecording(function() {
					let blob = rec.getBlob();
					invokeSaveAsDialog(blob);
				});
			}
			leaveCall2()
		}
	});

	socket.on("callEnd2", (from) => {
		if(from===call.from){
			console.log("stop2",callRecorded)
			if(callRecorded){
				rec.stopRecording(function() {
					let blob = rec.getBlob();
					invokeSaveAsDialog(blob);
				});
			}
			leaveCall2()
			setCall({ isReceivingCall: false, from:null, name: null,callerName:null, signal:null });
		}
	});

	const answerCall = () => {
		setCallAccepted(true);

		const peer = new Peer({ initiator: false, trickle: false, stream });

		peer.on("signal", (data) => {
			console.log("signal",data)
			socket.emit("answerCall", { signal: data, to: call.from });
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
				from: me,
				name,
			});
		});

		peer.on("stream", (currentStream) => {
			userVideo.current.srcObject = currentStream;
		});

		socket.on("callAccepted", (signal) => {
			rec.startRecording();
			console.log("rec start")
			setCallRecorded(true);
			setCallAccepted(true);
			peer.signal(signal);
		});

		connectionRef.current = peer;
	};

	const leaveCall = () => {
		setCallEnded(true);
		
		if(call.from){
			socket.emit("endCall1", {to: call.from });
		}
		else{
			socket.emit("endCall2", {to: me });
		}
		console.log("stop0",rec)
		if(callRecorded){
			rec.stopRecording(function() {
				let blob = rec.getBlob();
				console.log("stop",blob)
				invokeSaveAsDialog(blob);
			});
		}
		connectionRef.current.destroy();

		// window.location.reload();
	};
	const leaveCall2 = () => {
		
		setCallEnded(true);
		connectionRef.current.destroy();

		// window.location.reload();
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