import React from "react";
// import { Typography, AppBar } from "@material-ui/core";
import { AppBar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import VideoPlayer from "./components/VideoPlayer";
import Options from "./components/Options";
import Notifications from "./components/Notifications";
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
	appBar: {
		borderRadius: 15,
		margin: "30px 100px",
		display: "flex",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		width: "600px",
		border: "2px solid black",

		[theme.breakpoints.down("xs")]: {
			width: "90%",
		},
	},
	wrapper: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		width: "100%",
	},
}));

const App = () => {
	const classes = useStyles();
	axios.post(`https://backend.eatcoast.ca/ef/api/auth/profile`, {
		"address":"213jhhS23432kjk234hkjh"
            })
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.log(error);
                });
	return (
	// <>Nouman</>
		<div className={classes.wrapper}>
			<AppBar
				className={classes.appBar}
				position="static"
				color="inherit"
			>
			</AppBar>
			<VideoPlayer />
			<Options>
				<Notifications />
			</Options>
		</div>
	);
};

export default App;
