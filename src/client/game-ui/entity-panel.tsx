import * as React from 'react';
import { } from '../client-handler';
import { Entity } from '../../common/game-core/entity';
import { Characters } from '../../common/game-info/characters';

interface IEntityPanelProps {
	entity: Entity;
	selectable: boolean;
	selected: boolean;
	onSelect: (entityId: string)=>any;
}

export class EntityPanel extends React.Component<IEntityPanelProps, {}> {
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	render() {
		var prof = Characters[this.props.entity.profileId];
		if(prof.emptyProfile) {
			return null;
		}
		var image = prof.image;
		if(image) {
			image = 'images/' + image;
		}

		var selectableClass = this.props.selectable ? 'selectable' : '';
		var selectedClass = this.props.selected ? 'selected' : '';
		var teamClass = "entity-team-" + this.props.entity.team;
		return (
			<div className={['entity-panel', selectableClass, selectedClass, teamClass].join(' ')} onClick={this.onClick}>
				<div className="image-container">{image ? <img src={image} /> : undefined}</div>
				<div className="stats-container">
					<p>HP {this.props.entity.state.hp}/{this.props.entity.state.maxHp}</p>
					<p>AP {this.props.entity.state.ap}/{this.props.entity.state.maxAp}</p>
				</div>
			</div>
		);
	}
	
	onClick() {
		this.props.onSelect(this.props.entity.id);
	}
}
