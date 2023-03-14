import React, { useContext} from "react";
import {
	Button,
	TextField,
	Grid,
	Typography,
	Container,
	Paper,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Phone, PhoneDisabled } from "@material-ui/icons";
import { SocketContext } from "../SocketContext";
import { useSpeechSynthesis } from "react-speech-kit";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "flex",
		flexDirection: "column",
	},
	gridContainer: {
		width: "100%",
		[theme.breakpoints.down("xs")]: {
			flexDirection: "column",
		},
	},
	container: {
		width: "600px",
		margin: "35px 0",
		padding: 0,
		[theme.breakpoints.down("xs")]: {
			width: "80%",
		},
	},
	margin: {
		marginTop: 20,
	},
	padding: {
		padding: 20,
	},
	paper: {
		padding: "10px 20px",
		border: "2px solid black",
	},
}));
let orgName = [
	"",
	"Nurse 2 Nurse Staffing",
	"TLC Travel Staff" ,
	"Mynela Staffing",
	"LightHouse Nursing Inc",
	"RadLink Staffing"
];

const Options = ({ children }) => {
	const {callAccepted, leaveCall, callUser, callEnded } =
		useContext(SocketContext);
	const classes = useStyles();
	const { speak, voices ,cancel } = useSpeechSynthesis();
	return (
		<Container className={classes.container}>
			<Paper elevation={10} className={classes.paper}>
				<form className={classes.root} noValidate autoComplete="off">
					<Grid container className={classes.gridContainer}>
						<Grid item xs={12} md={12} className={classes.padding}>
							<Typography gutterBottom variant="h6">
								Make a call
							</Typography>
							<TextField
								label="ID to Call"
								
								onChange={(e) => {
									console.log()
									if(e.target.value < 1 || e.target.value > 5){
										e.target.value = "";
										cancel()
										speak({ text: "    You have Selected Wrong Option Please Select right Option"})
									}
									else{
										cancel()
										speak({ text: "    Welcome to "+orgName[e.target.value]+". Your call will be connected to one of our recruiter as soon as possible"})
										callUser(e.target.value)
									}
									
								}}
								fullWidth
							/>
							{callAccepted && !callEnded ? (
								<Button
									variant="contained"
									color="secondary"
									fullWidth
									startIcon={
										<PhoneDisabled fontSize="large" />
									}
									onClick={leaveCall}
									className={classes.margin}
								>
									Hang Up
								</Button>
							) : (
								<Button
									variant="contained"
									color="primary"
									fullWidth
									startIcon={<Phone fontSize="large" />}
									// onClick={() => {
									// 	callUser(idToCall);
									// }}
									onClick={() => speak({ text: "    Welcome to StaffGenix. Thank you for your call.  Please choose from the following options: press 1 For Nurse 2 Nurse Staffing.   press 2 For TLC Travel Staff. Press 3 For Mynela Staffing. Press 4 For LightHouse Nursing. Press 5 For RadLink Staffing.  ",voice: voices[2]})}
									className={classes.margin}
								>
									Call
								</Button>
							)}
						</Grid>
					</Grid>
				</form>
				{children}
			</Paper>
		</Container>
	);
};

export default Options;
