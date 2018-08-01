import * as React from 'react';

interface Props {
    value: number;
}
interface State {

}

export class DamageText extends React.Component<Props, State> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="damage">
                 <svg height="30" width="100">
                    <text x="0" y="25" fill="red" stroke="black" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" className="damage-text">
                        {this.props.value}
                    </text>
                </svg> 
            </div>
        )
    }
}
