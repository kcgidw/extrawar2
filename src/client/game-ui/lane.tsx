import * as React from 'react';
import { } from '../client-handler';
import { Team, Lane } from '../../common/game-core/common';
import { Entity } from '../../common/game-core/entity';
import { EntityPanel } from './entity-panel';
import { ALL_STEFS } from '../../common/game-info/stefs';

interface IProps {
	id: number;
	onSelect: (laneId: number)=>any;
	selectable: boolean;
	selected: boolean;
	entitiesSelectable: boolean;
	entities: Entity[];
	laneData: Lane;
	onSelectEntity: (entityId: string)=>any;
	selectedEntityId: string;
}
export class LanePanel extends React.Component<IProps,{}> {
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	render() {
		var classes = [
			'lane',
			this.props.selectable ? 'selectable' : '', 
			this.props.selected ? 'selected' : ''
		].join(' ');
		return (
			<div id={"lane-" + this.props.id} className={classes} onClick={this.onClick}>
				{this.renderTeamEntities(1)}
				{this.renderTeamEntities(2)}
				{this.renderLaneStefs(1)}
				{this.renderLaneStefs(2)}
			</div>
		);
	}

	onClick(e) {
		if(this.props.selectable) {
			this.props.onSelect(this.props.id);
		}
	}

	renderTeamEntities(t: Team) {
		return this.props.entities.filter((ent) => (ent.team === t))
		.map((ent) => {
			return (< EntityPanel key={ent.id} entity={ent} selected={this.props.selectedEntityId === ent.id} selectable={this.props.entitiesSelectable} onSelect={this.props.onSelectEntity} />);
		});
	}
	renderLaneStefs(t: Team) {
		return (
			<div className={`stefs stefs${t}`}>
				{
					this.props.laneData['stefs'+t].map((stef) => {
						var def = ALL_STEFS[stef.stefId];
						return <span key={stef.stefId}>{`${def.name} (${stef.duration})`}</span>;
					})
				}
			</div>
		);
	}
}