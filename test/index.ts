import Duplo, {zod} from "@duplojs/duplojs";
import duploSwagger, {SwaggerDeprecated, SwaggerDescription, SwaggerIgnore, SwaggerIgnoreInheritDescriptor, SwaggerResponses, SwaggerSchemes, SwaggerTag} from "../scripts";

const duplo = Duplo({port: 1506, host: "0.0.0.0"});
duplo.use(duploSwagger, {
	outputFile: "test/swagger.json",
	swaggerSpec: {
		tags: [{name: "user", description: "Route to iteract with user."}],
		schemes: ["test", "lolo"],
	},
});

const isOdd = duplo.createChecker(
	"isOdd", 
	{
		handler(input: number, output, options){
			if(input % 2 == 1) return output("odd", input);
			else return output("notOdd", input);
		},
		outputInfo: ["odd", "notOdd"],
	}, 
	new SwaggerDescription("verif if input is odd")
);

const process1 = duplo.createProcess("process1")
.check(
	isOdd,
	{
		input: () => 1,
		catch: () => {}
	},
)
.build([], new SwaggerDescription("super process"));

const Abstract1 = duplo.declareAbstractRoute("abstract1")
.build(undefined, new SwaggerDescription("pass par une route abstraite"));

Abstract1(undefined)
.declareRoute("GET", "/user/name")
.handler(() => {});

Abstract1(undefined, new SwaggerIgnoreInheritDescriptor())
.declareRoute("GET", "/user/name/2")
.handler(() => {});

duplo.declareRoute("POST", "/user")
.extract({
	body: {
		name: zod.enum(["math", "gab"]),
		age: zod.number().optional().openapi({example: 34}),
	}
})
.check(
	isOdd,
	{
		input: () => 1,
		catch: () => {}
	},
	new SwaggerIgnoreInheritDescriptor(),
	new SwaggerDescription("add checker isOdd"),
)
.handler(
	() => {},
	new SwaggerTag("user"),
	new SwaggerResponses({code: 200, description: ""}),
);

duplo.declareRoute("GET", "/titi")
.handler(
	() => {},
	new SwaggerIgnore()
);

duplo.declareRoute("GET", "/user/{name}")
.extract({
	params: {
		name: zod.enum(["math", "gab"]),
	}
})
.process(
	process1, 
	{},
)
.handler(
	({pickup}) => {},
	new SwaggerTag("user"),
	new SwaggerSchemes("test"),
	new SwaggerDescription("Get user by name"),
	new SwaggerDescription("User is so strong"),
);

duplo.declareRoute("GET", "/posts")
.extract({
	query: {
		page: zod.number().openapi({example: 15}),
	}
})
.handler(
	() => {},
);

duplo.declareRoute("DELETE", "/user/{id}")
.extract({
	params: {
		id: zod.number().openapi({example: 0}),
	},
	headers: {
		isAdmin: zod.boolean(),
	}
})
.handler(
	() => {},
	new SwaggerTag("user"),
	new SwaggerDeprecated(),
);

duplo.launch();
