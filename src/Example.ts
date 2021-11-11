import * as JSONSerializeable from './JSONSerializeable';
import {on, once, printConsole} from "skyrimPlatform"


class ExampleBaseJSONSerializeable extends JSONSerializeable.BaseJSONSerializable{
	foo:string = "This is JSON";
	
	public printString():void{
		printConsole(this.foo);
	}
}

//Add type for auto typing
JSONSerializeable.TypeManager.instance.addType(ExampleBaseJSONSerializeable)

//Create 2 unique Instance
let a = new ExampleBaseJSONSerializeable;
let b = new ExampleBaseJSONSerializeable;

//Change b string
b.foo = "This is B"

once('update', ()=>{
	//Print
	a.printString();
	b.printString();
	
	//Save to JContainers
	a.serializeObject(".Example.a");
	b.serializeObject(".Example.b");

	on("equip", ()=>{
		//Get new from JContainers
		//Deserialize by autotyping from TypeManager
		let c:ExampleBaseJSONSerializeable = JSONSerializeable.TypeManager.deserialize('.Example.a');
		
		//Deserialize by autotyping from static class function
		let d:ExampleBaseJSONSerializeable = ExampleBaseJSONSerializeable.deserialize('.Example.b');
		
		//Deserialize by custom applied type
		let e:ExampleBaseJSONSerializeable = ExampleBaseJSONSerializeable.deserialize('.Example.b', ExampleBaseJSONSerializeable);
		
		//Change string
		c.foo = c.foo + " after serialization"
		d.foo = d.foo + " after serialization"
		
		//Print
		c.printString(); //output : "This is JSON after serialization"
		d.printString(); //output : "This is B after serialization"
		
		//Sadly the object are copy instead of revived. thus a != c and b != d
 		a.printString(); //output : "This is JSON"
		b.printString(); //output : "This is B"
		c.printString(); //output : "This is JSON after serialization"
		d.printString(); //output : "This is B after serialization"
	});
	
});