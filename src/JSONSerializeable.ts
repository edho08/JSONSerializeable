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
	serialize(path:string):void;
	/*
	*	This will be called after am object property is deserialized
	*/
	onMemberDeserialized(prop:string, value:any):void;
	/*
	*	This will be called on serialization
	*/
	onMemberSerialized(prop:string, data:JSONAllData):void;
	/*
	*
	*/
	onMemberSerializedReplace(prop:string, value:any):any;
	onMemberDeserialzedRevive(prop:string, value:any):any;
	
}

/*
* @class BaseJSONSerializeAble 		: Implement to save to JSON.
* @Member	onObjectSerialization 	: Call this before serializing Object on base class
* @Member	onObjectDeserialization : Call this after deserializing Object on base class
* @Member	serialize				: Serialize object to JSON
* @Member	deserialize				: Deserialize object from JSON
*/
export abstract class BaseJSONSerializable implements JSONSerializeAble{
	
	public onObjectSerialization(data:JSONAllData):void{
		
	}
	
	public onObjectDeserialization(protoObj:any):any{
		
	}
	public serialize(path:string):void{
		TypeManager.serialize(path, this);
	}
	public static deserialize(path:string, type?:typeof BaseJSONSerializable):any{
		return TypeManager.deserialize(path, type);
	}
	
	public onMemberDeserialized(prop:string, value:any):void{
		
	} 
	
	public onMemberSerialized(prop:string, data:JSONAllData):void{
		
	}
	
	public onMemberSerializedReplace(prop:string, value:any):any{
		return value;
	}
	public onMemberDeserialzedRevive(prop:string, value:any):any{
		return value;
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
	public Types:Map<string, typeof BaseJSONSerializable> = new Map;
	
	public addType(type:typeof BaseJSONSerializable){
		this.Types.set(type.name, type);
	}
	
	public getType(name:string):typeof BaseJSONSerializable|undefined{
		return this.Types.get(name);
	}
	
	public static get instance():TypeManager{
		return TypeManager._instance || (TypeManager._instance = new TypeManager());
	}
	
	public static deserialize(path:string, type?:typeof BaseJSONSerializable):any{
		//God! Help us. Save the king!
		let data:string = JDB()?.solveStr(path, "{}");
		let protoObj:JSONAllData = JSON.parse(data);
		let Cls:typeof BaseJSONSerializable | undefined = undefined;
		let obj:any = null;
		
		//sp.writeLogs('JSONSerializeAble', data)
		
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
			//Call constructor with parameter of all data we had (EVIL).
      //@ts-ignore
			obj = new Cls();
      
			//The very definition of Evil. (and you think Harkon is bad)
			Object.keys(protoObj).forEach((key:string)=>{
				if(key == '') return;
				
				(obj as JSONAllData)[key]=protoObj[key];
				//Let repair object
				(obj as BaseJSONSerializable).onMemberDeserialized(key, protoObj[key]);
			});
			
			//Repair using JSON own reviver
			JSON.parse(data, obj.onMemberDeserialzedRevive);
			
			//Last call repair object
			(obj as JSONSerializeAble).onObjectDeserialization(obj as JSONAllData);
		}
		//Finally, to die in peace. Requescat in Pace!
		return obj;
	}
	
	public static serialize<T extends BaseJSONSerializable>(path:string, obj:T):void{
		//Mask as JSON data holder
		let data:JSONAllData = JSON.parse(JSON.stringify(obj, obj.onMemberSerializedReplace));
		
    //get class name (Evil possibly?)
		data.class = obj.constructor.name;
    
		//Iterate on member
		Object.keys(obj).forEach((key:string)=>{
			if(key == '') return;
			obj.onMemberSerialized(key, data);
		});
    
		//Let user add more data to store
		obj.onObjectSerialization(data);
		
		//JContainers
		JDB()?.solveStrSetter(path, JSON.stringify(data), true);
	}
}

/*
* This is adding type to Type Manager so we can revive our Object with desired Type
*/
TypeManager.instance.addType(BaseJSONSerializable);
