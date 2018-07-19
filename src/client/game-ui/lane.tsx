import * as React from 'react';
import { } from '../client-handler';
import { Team } from '../../common/game-core/common';
import { Entity } from '../../common/game-core/entity';
import { EntityPanel } from './entity-panel';

interface IProps {
	id: number;
	onSelect: (laneId: number)=>any;
	selectable: boolean;
	selected: boolean;
	entitiesSelectable: boolean;
	entities: Entity[];
	onSelectEntity: (entityId: string)=>any;
	selectedEntityId: string;
}
export class Lane extends React.Component<IProps,{}> {
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	render() {
		var classes = ['lane', this.props.selectable ? 'selectable' : '', this.props.selected ? 'selected' : ''].join(' ');
		return (
			<div id={"lane-" + this.props.id} className={classes} onClick={this.onClick}>
				{this.renderTeamEntities(1)}
				{this.renderTeamEntities(2)}
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
			return (< EntityPanel key={ent.username} entity={ent} selected={this.props.selectedEntityId === ent.entityId} selectable={this.props.entitiesSelectable} onSelect={this.props.onSelectEntity} />)
		});
	}
}