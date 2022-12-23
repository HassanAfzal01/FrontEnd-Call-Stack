import React, { useContext } from "react";
import { Grid, Typography, Paper, makeStyles } from "@material-ui/core";

import { SocketContext } from "../SocketContext";

const useStyles = makeStyles((theme) => ({
	audio: {
		width: "550px",
		[theme.breakpoints.down("xs")]: {
			width: "300px",
		},
	},
	gridContainer: {
		justifyContent: "center",
		[theme.breakpoints.down("xs")]: {
			flexDirection: "column",
		},
	},
	paper: {
		padding: "10px",
		border: "2px solid black",
		margin: "10px",
	},
}));

const VideoPlayer = () => {
	const {callAccepted, myVideo, userVideo, callEnded, stream, call } =
		useContext(SocketContext);
	const classes = useStyles();

	return (
		<Grid container className={classes.gridContainer}>
			{stream && (
						<audio
							playsInline
							muted
							ref={myVideo}
							autoPlay
							className={classes.video}
						/>
			)}
			{callAccepted && !callEnded && (
						<audio
							playsInline
							ref={userVideo}
							autoPlay
							className={classes.video}
						/>
			)}
		</Grid>
	);
};

export default VideoPlayer;
