
import { User } from "../server/lobby/user";
import { IMatchState, TargetRange, TargetWhat, Team } from "./game-core/common";
import { Entity } from "./game-core/entity";
import { ISkillDef } from "./game-info/skills";

export function getUserTeam (ms: IMatchState, user: User): Team {
    return getUsernameTeam(ms, user.username);
}
export function getUsernameTeam(ms: IMatchState, username: string): Team {
    return ms.players[username].team;
}
export function userShouldAct(ms: IMatchState, user: User): boolean {
    return usernameShouldAct(ms, user.username);
}
export function usernameShouldAct(ms: IMatchState, username: string): boolean {
    if(ms.players[username].alive) {
        if(getActingTeam(ms) === getUsernameTeam(ms, username)) {
            return true;
        }
    }
    return false;
}
export function teamDead(ms: IMatchState, t: Team): boolean {
    return ms['team'+t].every((username) => (!ms.players[username].alive) );
}

export function findEntities(match: IMatchState, filter?: {laneId?: number, laneRange?: number, team?: Team, aliveOnly?: boolean}): Entity[] {
    var res = Object.keys(match.players).map((username) => (match.players[username]));
    if(filter) {
        if(filter.laneId !== undefined) {
            let laneRange = filter.laneRange || 0;
            res = res.filter((ent) => (Math.abs(ent.state.y - filter.laneId)) <= laneRange);
        }
        if(filter.team !== undefined) {
            res = res.filter((ent) => (ent.team === filter.team));
        }
        filter.aliveOnly = filter.aliveOnly !== undefined ? filter.aliveOnly : true;
        if(filter.aliveOnly) {
            res = res.filter((ent) => (ent.alive === filter.aliveOnly));
        }
    }
    return res;
}

export function getActingTeam(ms: IMatchState): Team {
	if(ms.turn % 2 === 0) {
		return 2;
	}
	return 1;
}

export function actionDefTargetsEntity(ad: ISkillDef) {
	return [TargetWhat.ALLY, TargetWhat.ENEMY, TargetWhat.SELF, TargetWhat.ENTITY].indexOf(ad.target.what) !== -1;
}


export function otherTeam(x: Team): Team {
	if(x === 1) {return 2;}
	if(x === 2) {return 1;}
	throw new Error('bad team');
}

export function inRange(userY: number, targetY: number, actionDef: ISkillDef): boolean {
    if(actionDef.target.range === TargetRange.IN_LANE) {
        return userY === targetY;
    } else if(actionDef.target.range === TargetRange.NEARBY) {
        return Math.abs(userY - targetY) <= 1;
    } else { // range = ANY
        return true;
    }
}
export function validEntityTarget(user: Entity, target: Entity, actionDef: ISkillDef): boolean {
    if(!actionDefTargetsEntity(actionDef)) {
        return false;
    }
    if((actionDef.target.what === TargetWhat.ALLY && target.team !== user.team)
    || (actionDef.target.what === TargetWhat.SELF && user.id !== target.id)
    || (actionDef.target.what === TargetWhat.ENEMY && target.team === user.team)) {
        return false;
    }
    return inRange(user.state.y, target.state.y, actionDef);
}
export function validLaneTarget(user: Entity, laneId: number, actionDef: ISkillDef): boolean {
    if(actionDef.target.what !== TargetWhat.LANE) {
        return false;
    }
    return inRange(user.state.y, laneId, actionDef);
}