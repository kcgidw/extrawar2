import { Entity } from "../../common/game-core/entity";
import * as React from 'react';
import { IMatchState } from "../../common/game-core/match";
import { Team } from "../../common/game-core/instance-interfaces";
import { IPlayersReady, SOCKET_MSG } from "../../common/messages";
import * as Handler from '../client-handler';

interface ITeamProps {
	matchState: IMatchState;
	team: Team;
}

interface ITeamState {
	
}

export class TeamPanel extends React.Component<ITeamProps,ITeamState> {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id={"team-panel-"+this.props.team} className="team-panel">
				{this.renderReady()}
			</div>
		);
	}

	renderReady() {
		var teamUsernames: string[] = this.props.matchState['team'+this.props.team];
		return teamUsernames.map((username) => {
			var ready = this.props.matchState.playersReady[username];
			return <p key={username}>{username}{ready ? " - READY!" : ''}</p>;
		});
	}
}