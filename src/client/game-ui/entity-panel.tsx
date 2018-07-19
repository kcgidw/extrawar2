import * as React from 'react';
import { } from '../client-handler';
import { Entity } from '../../common/game-core/entity';

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
		if(this.props.entity.profile.emptyProfile) {
			return null;
		}
		var image = this.props.entity.profile.image;
		if(image) {
			image = 'images/' + image;
		}

		var selectableClass = this.props.selectable ? 'selectable' : '';
		var selectedClass = this.props.selected ? 'selected' : '';
		return (
			<div className={['entity-panel', selectableClass, selectedClass].join(' ')} onClick={this.onClick}>
				<div className="image-container">{image ? <img src={image} /> : undefined}</div>
				<div className="stats-container">
					<p>HP {this.props.entity.state.hp}/{this.props.entity.state.maxHp}</p>
					<p>AP {this.props.entity.state.ap}/{this.props.entity.state.maxAp}</p>
				</div>
			</div>
		);
	}
	
	onClick() {
		this.props.onSelect(this.props.entity.entityId);
	}
}
