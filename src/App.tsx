import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { fetchUserAttributes } from 'aws-amplify/auth';

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [userAttributes, setUserAttributes] = useState({ fullname: '', configurations: [] });

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });

    async function getUserAttributes() {
      try {
        const attributes = await fetchUserAttributes();
        const authString = attributes['custom:auth_string'];
        const parsedAttributes = JSON.parse(authString);
        setUserAttributes(parsedAttributes);
      } catch (error) {
        console.error('Error fetching user attributes:', error);
      }
    }

    getUserAttributes();
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>{user?.signInDetails?.loginId}'s todos</h1>
          <button onClick={createTodo}>+ new</button>
          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>{todo.content}</li>
            ))}
          </ul>
          <div>
            <h2>User Attribute:</h2>
            <p>Here are your dashboards, {userAttributes.fullname}</p>
            <ul>
              {userAttributes.configurations
                .sort((a, b) => a.order - b.order)
                .map((config, index) => (
                  <li key={index}>
                    Dashboard: {config.linkname} URL: <a href={config.url}>{config.url}</a>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
              Review next step of this tutorial.
            </a>
          </div>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}

export default App;
