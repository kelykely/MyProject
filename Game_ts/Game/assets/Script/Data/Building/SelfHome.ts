import { Building } from "./BuildingFactory";
import { Person } from "../PersonFactory";
import { MyGame } from "../../Tool/System/Game";
import { City } from "../CityFactory";
import { UserRole } from "../UserRoleFactory";

export class SelfHome extends Building {
    //自宅

    private restMaxPowerNeedTime: number;
    private restOneMinuteAddPowerNum: number;

    private restUpdateFuncId: number;

    constructor(buildingId: number, saveData: any, city: City) {
        super(buildingId, saveData, city);

    }

    //使用自宅
    useBuilding(personData: Person, typeStr: string) {
        super.useBuilding(personData, typeStr);
        //回复体力
        personData.power = MyGame.MAX_POWER;
        MyGame.LogTool.showLog(`${personData.name} 在家休息结束`);
    }

    roleUseBuilding(personData: UserRole, typeStr: string) {
        super.roleUseBuilding(personData, typeStr);
        switch (typeStr) {
            case MyGame.ITEM_FUNCTION_TYPE_REST:
                this.rest(personData);
                break;
        }
    }

    private rest(personData: UserRole) {
        if (personData.power >= MyGame.MAX_POWER) {
            MyGame.LogTool.showLog(`rest error ! power is max`);
            return;
        }
        //开始休息
        //获取恢复满体力需要的时间
        if (!this.restMaxPowerNeedTime) {
            let restFunctionData = this.getFunctionByType(MyGame.ITEM_FUNCTION_TYPE_REST);
            this.restMaxPowerNeedTime = restFunctionData.functionNumArr[0];
        }
        if (!this.restOneMinuteAddPowerNum) {
            this.restOneMinuteAddPowerNum = MyGame.MAX_POWER / this.restMaxPowerNeedTime;
        }
        //加入回调函数
        this.restUpdateFuncId = personData.addOneFunction(function (personData: UserRole, addMinute: number, data: any) {
            if (personData.power < MyGame.MAX_POWER) {
                MyGame.GameManager.changeGameSpeed(MyGame.QUICK_GAME_SPEED);
                MyGame.GameManager.userRole.power = MyGame.GameManager.userRole.power + data.restOneMinuteAddPowerNum * addMinute;
                if (MyGame.GameManager.userRole.power > MyGame.MAX_POWER) {
                    MyGame.GameManager.userRole.power = MyGame.MAX_POWER;
                    //清除掉这个回调
                    personData.removeOneFunctionById(this.restUpdateFuncId);
                    //恢复运行速度
                    MyGame.GameManager.gameSpeedResetting();
                }
            }
        }.bind(this), {
            restOneMinuteAddPowerNum: this.restOneMinuteAddPowerNum
        });
    }
}