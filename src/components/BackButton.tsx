import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

import "../../styles/BackButton.css";
/**
 * Button that navigates back to the previous page in the history stack.
 * Located at the top left corner of the page. Intended to be used on subpages of the application.
 *
 */
const BackButton = () => {
	const navigate = useNavigate();

	// Navigate back to the previous page in the history stack
	const handleClick = () => {
		if (window.history.length > 2) {
			// If there is more than one page in the history stack, go back to the previous page
			navigate(-1);
		} else {
			// If there is only one page in the history stack, go back to the home page
			navigate("/");
		}
	};

	return (
		<button className="back-button" onClick={handleClick}>
			<Icon icon="solar:arrow-left-linear" width={32} height={32} />
			<span>Back</span>
		</button>
	);
};

export default BackButton;
