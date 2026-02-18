import React from 'react';

function Sidebar() {
  return (
    <div className="w-64 bg-gray-100 h-screen p-4">
      <ul>
        <li className="group relative mb-2">
          <a href="#" className="block p-2 rounded-md hover:bg-gray-200">
            Dashboard
          </a>
          <div className="absolute left-full top-0 ml-2 bg-white border rounded-md shadow-md p-2 z-10 hidden group-hover:block">
            <p className="text-sm text-gray-600">View your main overview.</p>
          </div>
        </li>
        <li className="group relative mb-2">
          <a href="#" className="block p-2 rounded-md hover:bg-gray-200">
            Users
          </a>
          <div className="absolute left-full top-0 ml-2 bg-white border rounded-md shadow-md p-2 z-10 hidden group-hover:block">
            <ul className="list-disc pl-4">
              <li>View all users</li>
              <li>Add new user</li>
              <li>Edit user profiles</li>
            </ul>
          </div>
        </li>
        </ul>
    </div>
  );
}

export default Sidebar;