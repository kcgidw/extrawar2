import * as React from 'react';
import { Team, IEntityProfile } from "../../common/game-core/common";
import { IMatchState } from "../../common/game-core/common";
import { Entity } from '../../common/game-core/entity';
import { Characters } from '../../common/game-info/characters';
import { ALL_STEFS } from '../../common/game-info/stefs';
import { Skills } from '../../common/game-info/skills';

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
		var ms = this.props.matchState;
		var teamUsernames: string[] = ms['team'+this.props.team];
		return (
			<div id={"team-panel-"+this.props.team} className="team-panel">
				{teamUsernames.map((username) => (<TeamEntityPanel key={username} ent={ms.players[username]} ready={ms.playersReady[username]} team={this.props.team} />))}
			</div>
		);
	}
}

interface ITeamEntityPanelProps {
	ent: Entity;
	ready: boolean;
	team: Team;
}
class TeamEntityPanel extends React.Component<ITeamEntityPanelProps,{}> {
	constructor(props) {
		super(props);
	}

	render() {
		var ent = this.props.ent;
		var profile = Characters[this.props.ent.profileId];

		var show: boolean = !profile.emptyProfile;
		var imageElem = null;
		var hpElem = null, apElem = null, respawnElem = null, ready = null, stefsElem = null, passivesElem = null;
		if(show) {
			imageElem = <img src={'images/' + profile.image} />;
			hpElem = ent.state.hp > 0 ? <p><span className="curHp">{ent.state.hp}</span> / {ent.state.maxHp} HP</p> : null;
			respawnElem = ent.state.hp <= 0 ? ent.state.respawn === 1 ? <p className="respawn">Respawn next cycle</p> : <p className="respawn">Respawn in {ent.state.respawn}</p> : null;
			apElem = <p>{ent.state.ap} / {ent.state.maxAp} AP</p>;
			stefsElem = (
				<div className="stefs">
					{ent.state.stefs.map((stef) => {
						var def = ALL_STEFS[stef.stefId];
						return (<span key={''+stef.stefId+stef.invokerEntityId}>
							{def.name} ({stef.duration})
						</span>);
					})}
				</div>
			);
			passivesElem = (
				<div className="passives">
					{ent.state.passiveIds.map((pid) => {
						var def = Skills[pid];
						return (<span key={''+def.id}>
							{def.name}
						</span>);
					})}
				</div>
			);
		}
		if(this.props.ready) {
			ready = ' - READY!';
		}

		return (
			<div className={"team-entity-panel " + "team-"+this.props.team}>
				<p className="name">{this.props.ent.id}{ready}</p>
				{imageElem}
				{hpElem}{respawnElem}
				{apElem}
				{passivesElem}
				{stefsElem}
			</div>
		);
	}
}