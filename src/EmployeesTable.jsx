import { v4 as uuidv4 } from 'uuid';
import "./index.css";

export default function EmployeesTable (props) {
    let commonProjects = props.commonProjects;
    return commonProjects.length ? (<table className='table'>
            <thead>
                <tr>
                <th>Employee ID #1</th>
                <th>Employee ID #2</th>
                <th>Project ID</th>
                <th>Days Worked</th>
                </tr>
            </thead>
            <tbody>
                {commonProjects.map((project, index) => {
                    return <tr key={uuidv4()} className={`${index % 2 ? "rowStyle" : ""}`}>
                        {Object.values(project).map(value => {
                        return <td key={uuidv4()}>{value}</td>
                    })}
                    </tr>
                })}
            </tbody>
        </table>)
        : "";
}