import { Entity } from "../../common/game-core/entity";
import * as React from 'react';

class CharacterPanel extends React.Component<Entity,{}> {
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	render() {
		return (
			<div className="character-panel">
			</div>
		);
	}

	onClick(e) {
	}
}