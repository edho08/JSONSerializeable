import * as sp from "skyrimPlatform"
export let JDB = ()=>(sp as any).JDB


/*
* @interface JsonSerializeAbleData 	: This javascript artifact can hold anything you want.
* @Member	onObjectSerialization 	: Call this before serializing Object on base class
* @Member	onObjectDeserialization : Call this after deserializing Object on base class
* @Member	serialize				: Serialize object to JSON
* @Member	deserialize				: Deserialize object from JSON
*/
export interface JSONAllData{
	[k:string]: any;
}

/*
* @interface JSONSerializeAble 		: Implement to save to JSON for custom way to serialize Object.
* @Member	path 					: Path to save on JContainer. Should be unique per object instance
* @Member	onObjectSerialization 	: Call this before serializing Object on base class
* @Member	onObjectDeserialization : Call this after deserializing Object on base class
* @Member	serialize				: Serialize object to JSON
* @Member	deserialize				: Deserialize object from JSON
*/

export interface JSONSerializeAble{
	/*
	*	This is where you add derived data. E.g. object id of reference, possible constructor argument, etc.
	*/
	onObjectSerialization(data:JSONAllData):void;
	/*
	*	The deserialization process might be broken. This is where you repair your object.
	*/
	onObjectDeserialization(protoObj:JSONAllData):any;
	/*
	*	Call this to serialize object
	*/
	serializeObject(path:string):void;
}

/*
* @interface BaseJSONSerializeAble 		: Implement to save to JSON.
* @Member   onObjectSerialization 	: Call this before serializing Object on base class
* @Member	onObjectDeserialization : Call this after deserializing Object on base class
* @Member	serialize				: Serialize object to JSON
* @Member	deserialize				: Deserialize object from JSON
*/
export abstract class BaseJSONSerializable implements JSONSerializeAble{
	
	public onObjectSerialization(data:JSONAllData):void{
		
	}
	
	public onObjectDeserialization(protoObj:any):any{
		
	}
	public serializeObject(path:string):void{
		//Mask as JSON data holder
		let data:JSONAllData = (this as any);
		//Evil! get class name
		data.class = this.constructor.name;
		//Let user add more data to store
		this.onObjectSerialization(data);
		//JContainers
		JDB()?.solveStrSetter(path, JSON.stringify(data), true);
	}
	public static deserialize(path:string, type?:Function):any{
		return TypeManager.deserialize(path, type);
	}
}


/*
 @class TypeManager 	: On first load be sure to add Script Type to this so it can be deserialized. Unless i figured how to get Class from somewhere, this is all we got.
 @Member _instance		: Singleton instance.
 @Member Types 			: Type known.
 @Func addType 			: add Script Type
 @param addType 		: Script Type
 @Getter instance		: singleton		
*/
export class TypeManager {
	private static _instance:TypeManager = new TypeManager;
	public Types:Map<string,Function> = new Map;
	
	public addType(type:Function){
		this.Types.set(type.name, type);
	}
	
	public static get instance():TypeManager{
		return TypeManager._instance || (TypeManager._instance = new TypeManager());
	}
	public static deserialize(path:string, type?:Function):any{
		//God! Help us. Save the king!
		let data:string = JDB()?.solveStr(path, "{}");
		let protoObj:JSONAllData = JSON.parse(data);
		let Cls:Function | undefined = undefined;
		let obj:any = null;
		
		//if user supplied type
		if(type)
			Cls = type;
		//else use type that are registered
		else
			Cls = TypeManager.instance.Types.get(protoObj.class);
		
		//You forgot to add your type to TypeManager and not providing with type. Fallback!
		if(!Cls)
			Cls = BaseJSONSerializable;
		
		//JS shenanigan
		if(Cls && protoObj){ 
			//Call constructor with parameter of all data we had.
			obj = new (Function.prototype.bind.apply(Cls, protoObj as any));
			//The very definition of Evil. (and you think Harkon is bad)
			Object.keys(protoObj).forEach((key:string)=>{(obj as JSONAllData)[key]=protoObj[key]});
			//Let user repair object
			(obj as JSONSerializeAble).onObjectDeserialization(protoObj);
		}
		//Finally, to die in peace. Requescat in Pace
		return obj;
	}
}

/*
* This is adding type to Type Manager so we can revive our Object with desired Type
*/
TypeManager.instance.addType(BaseJSONSerializable);